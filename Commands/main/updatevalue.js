const { EmbedBuilder } = require('discord.js');
const { Color } = require('../../config.json');
const emoji = require('../../emoji.json');
let FruitModel = require('../../database/main/fruits');

module.exports = {
    name: 'updatevalue',
    description: "Update or add information to an item.",

    run: async (client, message, args) => {
        let interaction = message; 

await message.channel.sendTyping();
        let owners = ['904813903811321866', '195857623692738560'];
        if (!owners.includes(message.author.id)) return interaction.reply({ content: `${emoji.error} | You are not authorized to use this command.`, ephemeral: true });
     
        if (args.length < 1) {
            return message.reply('Usage: +updatevalue <item> [value] [demand] [description] [robuxprice] [permvalue] [pricecash] [rarity] [type] [image]');
        }
        const item = args[0].toLowerCase(); // Ensure consistent casing
        const propertiesToUpdate = {};

        if (args[1]) propertiesToUpdate.value = args[1];
        if (args[2]) propertiesToUpdate.demand = args[2];
        if (args[3]) propertiesToUpdate.description = args[3];
        if (args[4]) propertiesToUpdate.robuxprice = args[4];
        if (args[5]) propertiesToUpdate.permvalue = args[5];
        if (args[6]) propertiesToUpdate.pricecash = args[6];
        if (args[7]) propertiesToUpdate.rarity = args[7];
        if (args[8]) propertiesToUpdate.type = args[8];
        if (args[9]) propertiesToUpdate.image = args[9];

        let existingFruit = await FruitModel.findOne({ fruit: item });

        if (existingFruit) {
            // Update existing item
            Object.assign(existingFruit, propertiesToUpdate);
            existingFruit.date = `<t:${Math.floor(new Date().getTime() / 1000)}:f>`;
            await existingFruit.save();
        } else {
            // Add new item
            await FruitModel.create({
                fruit: item,
                ...propertiesToUpdate,
                date: `<t:${Math.floor(new Date().getTime() / 1000)}:f>`
            });
        }

        let embed = new EmbedBuilder();
        embed.setColor(`Blurple`);

        // Use the updated information
        embed.setDescription(`${propertiesToUpdate.description}\n**Last Updated**: <t:${Math.floor(new Date().getTime() / 1000)}:f>`);
        if (propertiesToUpdate.image) embed.setThumbnail(propertiesToUpdate.image);

        const fields = [];
        if (item) fields.push({ name: 'Name', value: item });
        if (value) fields.push({ name: 'Value', value: value.toLocaleString() });
        if (permvalue) fields.push({ name: 'Perm Value', value: permvalue.toLocaleString() });
        if (robuxprice) fields.push({ name: 'Price (robux)', value: robuxprice.toLocaleString() });
        if (pricecash) fields.push({ name: 'Price (cash)', value: pricecash.toLocaleString() });
        if (demand) fields.push({ name: 'Demand', value: demand });
        if (rarity) fields.push({ name: 'Rarity', value: rarity });

        embed.addFields(fields);

        message.reply({ embeds: [embed] });
        message.channel.send(`Successfully updated ${item}`);
    },
};