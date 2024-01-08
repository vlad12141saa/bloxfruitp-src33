
const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder } = require('discord.js');
let MessageActionRow = ActionRowBuilder;
let MessageEmbed = EmbedBuilder;
let MessageButton = ButtonBuilder;
const Discord = require(`discord.js`)
let DB = require(`../../database/main/stock`)
module.exports = {
  name: "stock",
  description: "Set a channel where stocks from bloxfruits should be sent",
  //type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "channel",
      description: "The channel.",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
    {
      name: "role",
      description: "Its not required but if you want to mention a role?",
      type: ApplicationCommandOptionType.Role,
      required: false,
    },


  ],


  run: async (client, interaction, args) => {

      let message = interaction;
let guild = interaction.guild;
await interaction.deferReply();
if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild))
return   interaction.followUp({
  embeds: [new Discord.EmbedBuilder()
    .setAuthor({ name: `${interaction.author.tag}`, iconURL:interaction.author?.displayAvatarURL({ dynamic: true }) || null })
      .setDescription(`> ${emoji.error} ${message.author}: You're missing the \`Manage Guild\` permission`)
      .setColor(Color)
  ]
});
let channel = interaction.options.getChannel(`channel`);
let role = interaction.options.getRole(`role`);
if(!channel) {
    let findstock = await DB.findOne({
        GuildID: interaction.guild.id,
    });
    if(findstock) {
        interaction.followUp(`Since no stock channel were provided, i've removed <#${findstock.ChannelID}>.`)
    } else {
        interaction.followUp(`You have not properly added options so therefore I can not disable.`)

    }
} else {
    let check = await DB.findOne({
        GuildID: interaction.guild.id,
    });
if(check) {
   if(channel) check.ChannelID = channel.id;
    if(role) check.RoleID = role.id;
    await check.save();

} else {
   if(!role) await DB.create({
        GuildID: interaction.guild.id,
        ChannelID: channel.id,
    })
    if(role) await DB.create({
        GuildID: interaction.guild.id,
        ChannelID: channel.id,
        RoleID: role.id || null
    })
}
interaction.followUp(`:white_check_mark: Updated.`)
}
        
        } 
}
