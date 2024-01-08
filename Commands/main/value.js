const { ActionRowBuilder, SelectMenuBuilder, ApplicationCommandType, ApplicationCommandOptionType, ButtonStyle, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { Color } = require(`../../config.json`)
let MessageActionRow = ActionRowBuilder;
let MessageEmbed = EmbedBuilder;
let MessageButton = ButtonBuilder;
const discord = require("discord.js");
const emoji = require(`../../emoji.json`)
let fruitDB = require(`../../database/main/fruits`);
module.exports = {
	name: 'value',
type: ApplicationCommandType.ChatInput,
	description: "Get information about on a bloxfruit.",

   options: [
                {
                    name: 'item',
                    description: 'The bloxfruit you want to get information about',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ],
    
	run: async (client, message, args) => {
 let interaction = message;
    let value = args.join(" ");
    if(!args[0]) return message.reply(`No args were given. **+value <item>**.`)
    await message.channel.sendTyping();

    let fruit = await fruitDB.findOne({ fruit: value.toLowerCase() });
 if(!fruit) return interaction.reply({ content: `That fruit does not exist!` });
 let embed = new EmbedBuilder();
 embed.setColor(`Blurple`);
 embed.setAuthor({ name: `🏝️ Blox Fruits Values 🏝️`, iconURL: `https://media.discordapp.net/attachments/1166167031662518346/1177015509745680484/Blox-fruits-Tier-list.png?ex=6570f81d&is=655e831d&hm=de6626803abb702ba0d8f625566592737b37d13e968531c776f2fcae943db5b1&=&format=webp&width=1193&height=671` });
 
 if(fruit.description) embed.setDescription(`\`\`\`${fruit.description}\`\`\`\n**Last Updated**: ${fruit.date}`);
 if(fruit.image) { 
 
   embed.setURL(`${fruit.image}`);
   embed.setThumbnail(fruit.image);
 }
 const fields = [];
 if (fruit.fruit) { 
   function capitalizeFirstLetter(str) {
     return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
 }let capitalizedString = capitalizeFirstLetter(fruit.fruit);
 
   embed.setTitle(`${capitalizedString}`);
  }
  console.log(fruit)
  if (fruit.value !== undefined && typeof fruit.value === 'number') {
   fields.push({ name: 'Value', value: `${fruit.value.toLocaleString()}`, inline: true});
 }
 if (fruit.permvalue) fields.push({ name: 'Perm Value', value: `${fruit.permvalue.toLocaleString()}`, inline: true });
 if (fruit.robuxprice) fields.push({ name: 'Price (robux)', value: `${fruit.robuxprice.toLocaleString()}`, inline: true  });
 if (fruit.pricebeli) fields.push({ name: 'Price (cash)', value: `${fruit.pricebeli.toLocaleString()}`, inline: true  });
 if (fruit.demand) fields.push({ name: 'Demand', value: fruit.demand, inline: true });
 if (fruit.rarity) fields.push({ name: 'Rarity', value: fruit.rarity, inline: true });
 if (fruit.type) fields.push({ name: 'Type', value: fruit.type, inline: true});
 
 embed.addFields(fields);
 
 const confirm = new ButtonBuilder()
 .setLabel('Invite Me')
 .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
 .setStyle(ButtonStyle.Link);

const cancel = new ButtonBuilder()
.setURL(`https://discord.gg/impuls`)
 .setLabel('Server')
 .setStyle(ButtonStyle.Link);

const row = new ActionRowBuilder()
 .addComponents(cancel, confirm);
interaction.reply({ embeds: [embed], components: [row]});

  }
}

