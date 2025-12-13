const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class ResponseManager {
  constructor(guidelinesPath) {
    this.guidelinesPath = guidelinesPath;
    this.guidelines = {};
    this.cooldowns = new Map();
    this.loadGuidelines();
  }

  loadGuidelines() {
    try {
      const data = fs.readFileSync(this.guidelinesPath, 'utf8');
      this.guidelines = JSON.parse(data);
      logger.info('Guidelines loaded successfully');
    } catch (error) {
      logger.error('Failed to load guidelines:', error);
      this.guidelines = { guidelines: { rules: [] }, commands: { list: [] } };
    }
  }

  reloadGuidelines() {
    this.loadGuidelines();
    logger.info('Guidelines reloaded');
  }

  checkCooldown(ruleId, username) {
    const key = `${ruleId}_${username}`;
    const now = Date.now();
    
    if (this.cooldowns.has(key)) {
      const lastTrigger = this.cooldowns.get(key);
      const rule = this.guidelines.guidelines.rules.find(r => r.id === ruleId);
      const cooldownTime = (rule?.cooldown || 0) * 1000;
      
      if (now - lastTrigger < cooldownTime) {
        return false; // Still in cooldown
      }
    }
    
    this.cooldowns.set(key, now);
    return true; // Can respond
  }

  checkTrigger(message, trigger, triggerType) {
    const lowerMessage = message.toLowerCase();
    const lowerTrigger = trigger.toLowerCase();

    switch (triggerType) {
      case 'contains':
        return lowerMessage.includes(lowerTrigger);
      case 'startsWith':
        return lowerMessage.startsWith(lowerTrigger);
      case 'endsWith':
        return lowerMessage.endsWith(lowerTrigger);
      case 'exact':
        return lowerMessage === lowerTrigger;
      case 'regex':
        try {
          const regex = new RegExp(lowerTrigger, 'i');
          return regex.test(lowerMessage);
        } catch (e) {
          logger.error(`Invalid regex pattern: ${lowerTrigger}`, e);
          return false;
        }
      default:
        return lowerMessage.includes(lowerTrigger);
    }
  }

  findMatchingRule(message, username) {
    const rules = this.guidelines.guidelines?.rules || [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      // Check if any trigger matches
      const triggered = rule.triggers.some(trigger => 
        this.checkTrigger(message, trigger, rule.triggerType)
      );

      if (!triggered) continue;

      // Check probability (if defined)
      const probability = rule.probability !== undefined ? rule.probability : 1;
      if (Math.random() > probability) {
        logger.debug(`Rule ${rule.id} skipped due to probability`);
        continue;
      }

      // Check cooldown
      if (!this.checkCooldown(rule.id, username)) {
        logger.debug(`Rule ${rule.id} on cooldown for ${username}`);
        continue;
      }

      // Return matching rule
      return rule;
    }

    return null;
  }

  getResponse(rule, username) {
    if (!rule || !rule.responses || rule.responses.length === 0) {
      return null;
    }

    // Get random response from the list
    const response = rule.responses[Math.floor(Math.random() * rule.responses.length)];
    
    // Replace placeholders
    return response
      .replace('{user}', username)
      .replace('{USER}', username.toUpperCase());
  }

  handleCommand(message, username) {
    const commands = this.guidelines.commands;
    
    if (!commands || !commands.enabled) return null;

    const prefix = commands.prefix || '!';
    if (!message.startsWith(prefix)) return null;

    const commandName = message.slice(prefix.length).split(' ')[0].toLowerCase();
    const command = commands.list.find(cmd => 
      cmd.name === commandName && cmd.enabled
    );

    if (!command) return null;

    // Check cooldown
    if (!this.checkCooldown(`cmd_${commandName}`, username)) {
      logger.debug(`Command ${commandName} on cooldown for ${username}`);
      return null;
    }

    return command.response;
  }
}

module.exports = ResponseManager;
