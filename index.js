const {  WebhookClient } = require("discord.js");
const { AuditLogEvent } = require('discord.js');
const emoji = require("./emoji.json")
const mongoose = require("mongoose")
let Color = `#2c2d31`;
let cooldowns = new Map();
const StickyDB = require("./database/main/sticky");

  const wait = require('util').promisify(setTimeout);
const { loadCommands } = require("./handlers/loadCommands");
const { loadSlashCommands } = require("./handlers/loadSlashCommands")
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const prefixModel = require("./database/main/prefix");
const discord = require("discord.js");
const Discord = require("discord.js");
const stock = require("./database/main/stock");
const fruits = require("./database/main/fruits");

const { ActionRowBuilder, ActivityType, InteractionType, PermissionsBitField,TextInputBuilder,TextInputStyle, ChannelType,UserSelectMenuBuilder, ModalBuilder, SelectMenuBuilder, ButtonStyle, Events, ButtonBuilder, EmbedBuilder } = require('discord.js');
const client = new Client({
  allowedMentions: { parse: ["users", "roles"] },
  intents: [
GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildWebhooks, 
  	GatewayIntentBits.GuildBans, 
     GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildPresences, 
		GatewayIntentBits.GuildMessageReactions, 
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
   	GatewayIntentBits.GuildMembers, 
     GatewayIntentBits.GuildEmojisAndStickers
  ],
  partials: [
  Partials.Channel,
  Partials.Message,
  Partials.User,
  Partials.GuildMembers,
  Partials.Reaction,
],

//restGlobalRateLimit: 0,
});

client.commands = new Collection();
client.setMaxListeners(0);
const MessageEmbed = EmbedBuilder;
const MessageActionRow = ActionRowBuilder;
const MessageButton = ButtonBuilder;
const MessageSelectMenu = SelectMenuBuilder;
client.slash = new Collection();

process.on("unhandledRejection", (reason, promise) => {
  console.log(
    "[FATAL] Possibly Unhandled Rejection at: Promise ",
    promise,
    " reason: ",
    reason.message
  );

});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // You can add more error handling or logging here if needed.
});

loadSlashCommands(client);
loadCommands(client);
client.on("ready", async (client) => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on(`messageCreate`, async (message) => {
  if (message.author.bot) return;


  let client = message.client;
let prefix = `+`;
 let prefixinguild = await prefixModel.findOne({ Guild: message.guild.id });
 if(prefixinguild && prefixinguild.Prefix) prefix = prefixinguild.Prefix || `+`;

console.log(`${message.author.tag} used the command ${message.content} (prefix: ${prefix})`);
  const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
    prefix = message.content.match(prefixMention)
    ? message.content.match(prefixMention)[0]
    : prefix;

  if (message.content.indexOf(prefix) !== 0) return;

  if (!message.content.startsWith(prefix)) return;

 
if (!message.member)
    message.member = message.guild.fetchMember(message);

    
  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;

  let command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd))
let interaction = message;
 if(!command) return;
 


  
    
   
  command.run(client, message, args)
 
  
})
client.on('ready', async (client) => {

  
      client.user.setActivity({
        name: `+value`,
        type: ActivityType.Streaming,
        url: `https://www.twitch.tv/onlyyxny`,
  
      });
  
    
        })
client.on("messageCreate", async (message) => {
  const { guildId, channelId } = message;
    if (message.author.bot) return;

    StickyDB.findOne({ GuildID: guildId, ChannelID: channelId }, async (err, data) => {
        if(err) throw err;
        if (data) {
            if (data.MessageCount >= data.Threshold) {
              const Count = await StickyDB.findOne({ GuildID: guildId, ChannelID: channelId });
              Count.MessageCount = 0;
              Count.save();
                           message.channel.messages.fetch(data.Lastmsg).then(fetchedMessage => fetchedMessage.delete()).catch(() => null);
	const e = new MessageActionRow()
			.addComponents(new MessageButton()
          .setCustomId(`greet-show`)
.setDisabled(true)
.setLabel("Sticky Message")
          .setStyle(ButtonStyle.Secondary))
              message.channel.send({ components: [e], content: `${ data.Message }`}).then((msg) => {
                Count.Lastmsg = msg.id;
                Count.save();
              })
            } else {
              const Count = await StickyDB.findOne({ GuildID: guildId, ChannelID: channelId });
              Count.MessageCount += 1;
              Count.save();
              return;
            }
        }
    })
 
})
client.on("interactionCreate", async (interaction) => {
  let int = interaction;
  if (interaction.isAutocomplete()) {
    if (interaction.commandName == "value") {
        let data = await fruits.find({
          rarity: { $in: ['Mythical', 'Legendary'] }
        })
        
        console.log(data);
      
      if (data.length == 0) {
       interaction.respond([]);
      }
       interaction.respond(data.map(opts => {
          return {
              name: opts.fruit ?? "Unknown",
              value: opts.fruit
          }
      }));
    }
    
  }

       if(interaction.type === InteractionType.ApplicationCommand) {
         console.log(`s`)
        const command = client.slash.get(interaction.commandName);
        if (!command) return interaction.reply(`Command was not found.`)
        
let message = interaction;
    
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  let cooldownAmount = (command.cooldown || 1.0) * 1000;
  if (timestamps.has(message.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `**${interaction.user.tag}** Cool down (**${timeLeft.toFixed(
          1
        )} seconds** left)`
      );
    }
  }

  timestamps.set(message.user.id, now);
  setTimeout(() => timestamps.delete(message.user.id), cooldownAmount);
  if(!interaction.channel.permissionsFor(interaction.guild.members.me).has([PermissionsBitField.Flags.SendMessages])) return message.author.send({content: `${emoji.error}| I am missing the Permission to \`SendMessages\` in ${message.channel}`,});
  if(!interaction.channel.permissionsFor(interaction.guild.members.me).has([PermissionsBitField.Flags.UseExternalEmojis]))  return message.reply({content: `${emoji.error}| I am missing the Permission to \`UseExternalEmojis\` in ${message.channel}`});
  if(!interaction.channel.permissionsFor(interaction.guild.members.me).has([PermissionsBitField.Flags.EmbedLinks])) return message.reply({ content: `${emoji.error} I am missing the Permission to \`EmbedLinks\` in ${message.channel}` });
  
  
  
            command.run(client, interaction);
}

});
client.on(`messageCreate`, async message => {
  if(message.author.id === `1173687711694065746` && message.channel.id === `1173325897647001682`)  {
let array = await stock.find({});
for (const data of array) {
  let guild = client.guilds.cache.get(data.GuildID);
  if(!guild) return;
  let message = message.content;
  let channel = guild.channels.cache.get(data.ChannelID);
  if(!channel) return;
  let role = guild.roles.cache.get(data.RoleID);
  
  if(role) message = `${message.content}\n--> [ping] ${role}`
  console.log(data);
  channel.send(message);
}
  }
})
client.login(`MTE3Njk3MzAwMjk4NzAzMjU5Nw.Gyx7dC.PZODzJr7exfXSlX097iTemn-DAtuxhkkHtNUbw`)