const { ActionRowBuilder, SelectMenuBuilder, ApplicationCommandType, ApplicationCommandOptionType, ButtonStyle, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { Color } = require(`../../config.json`)
let MessageActionRow = ActionRowBuilder;
let MessageEmbed = EmbedBuilder;
let MessageButton = ButtonBuilder;
const discord = require("discord.js");
const emoji = require(`../../emoji.json`)
let fruitDB = require(`../../database/main/fruits`);
module.exports = {
	name: 'updatevalue',
type: ApplicationCommandType.ChatInput,
	description: "Update or add infomration to a item.",

   options: [
                {
                    name: 'item',
                    description: 'the name of the item.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'value',
                    description: 'the value of the item.',
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                },
                {
                    name: 'demand',
                    description: 'the demand of the item.',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: 'description',
                    description: 'the description of the item.',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: 'robuxprice',
                    description: 'the robuxprice of the item.',
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                },
                {
                    name: 'permvalue',
                    description: 'the permvalue of the item.',
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                },
                {
                    name: 'pricecash',
                    description: 'the pricecash of the item.',
                    type: ApplicationCommandOptionType.Number,
                    required: false,
                },
                {
                    name: 'rarity',
                    description: 'the rarity of the item.',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: 'type',
                    description: 'the type of  item.',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
                {
                    name: 'image',
                    description: 'the image link of the item.',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
             

            ],
    
            run: async (client, interaction) => {
                await interaction.deferReply({ ephemeral: true });
        
                let owners = ['904813903811321866', '195857623692738560'];
                if (!owners.includes(interaction.user.id)) return interaction.followUp({ content: `${emoji.error} | You are not authorized to use this command.`, ephemeral: true });
                let item = interaction.options.getString('item');
                let value = interaction.options.getNumber('value');
                let demand = interaction.options.getString('demand');
                let description = interaction.options.getString('description');
                let robuxprice = interaction.options.getNumber('robuxprice');
                let permvalue = interaction.options.getNumber('permvalue');
                let pricecash = interaction.options.getNumber('pricecash');
                let rarity = interaction.options.getString('rarity');
                let type = interaction.options.getString('type');
                let image = interaction.options.getString('image');
                FruitModel = fruitDB;
                let existingFruit = await FruitModel.findOne({ fruit: item.toLowerCase() });
        
                if (existingFruit) {
                    // Update existing item
                   if(value) existingFruit.value = value;
                   if(demand) existingFruit.demand = demand;
                   if(description) existingFruit.description = description;
                 if(robuxprice)   existingFruit.robuxprice = robuxprice;
                   if(permvalue) existingFruit.permvalue = permvalue;
                   if(pricecash) existingFruit.pricebeli = pricecash;
                  if(rarity)  existingFruit.rarity = rarity;
                 if(type)   existingFruit.type = type;
                  if(image)  existingFruit.image = image;
                    existingFruit.date = `<t:${Math.floor(new Date().getTime() / 1000)}:f>`
        
                    await existingFruit.save();
                } else {
                    // Add new item
                    await FruitModel.create({
                        fruit: item.toLowerCase() || null,
                        value: value || null,
                        demand: demand || null,
                        description: description || null,
                        robuxprice: robuxprice || null,
                        permvalue: permvalue || null,
                        pricebeli: pricecash || null,
                        rarity: rarity || null,
                        type: type || null,
                        image: image || null,
                        date: `<t:${Math.floor(new Date().getTime() / 1000)}:f>`
                    });
                }
        
                let embed = new EmbedBuilder();
                embed.setColor(`Blurple`);
        
                // Use the updated information
                embed.setDescription(`${description}\n**Last Updated**: <t:${Math.floor(new Date().getTime() / 1000)}:f>`);
                if (image) embed.setThumbnail(image);
        
                const fields = [];
                if (item) fields.push({ name: 'Name', value: item });
                if (value) fields.push({ name: 'Value', value: `${value.toLocaleString()}` });
                if (permvalue) fields.push({ name: 'Perm Value', value: `${permvalue.toLocaleString()}` });
                if (robuxprice) fields.push({ name: 'Price (robux)', value: `${robuxprice.toLocaleString()}` });
                if (pricecash) fields.push({ name: 'Price (cash)', value: `${pricecash.toLocaleString()}` });
                if (demand) fields.push({ name: 'Demand', value: demand, inline: true });
                if (rarity) fields.push({ name: 'Rarity', value: rarity, inline: true });
        
                embed.addFields(fields);
        
                interaction.followUp({ embeds: [embed] });
                interaction.channel.send(`Successfully updated ${item}`);
            }
        };