const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder } = require('discord.js');
let MessageActionRow = ActionRowBuilder;
let MessageEmbed = EmbedBuilder;
let MessageButton = ButtonBuilder;
const emoji = require("../../emoji.json") 
const StickyDB = require("../../database/main/sticky");
const { Color}  = require(`../../config.json`);
module.exports = {
  name: "sticky",
  description: "Manage sticky messages!",
  permission: "MANAGE_MESSAGES",
type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "create",
      description: "Creates a new sticky message.",
    type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "Choose a channel you wish to apply the sticky message to.",
      type: ApplicationCommandOptionType.Channel,
          required: true
        },
        {
            name: "threshold",
            description: "Enter the threshold for when the sticky message should be resent.",
           type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: "text",
            description: "Enter the text you wish to add to the sticky message.",
       type: ApplicationCommandOptionType.String,
            required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Delete sticky messages.",
         type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "A channel you wish to delete a sticky message from.",
       type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
    },
    {
        name: "list",
        description: "Lists all sticky messages applied to this server.",
            type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  /**
   * 
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
    run: async(client, interaction, args) => {
    const { options, member, guildId } = interaction;
    const { PermissionFlagsBits } = require('discord.js')
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
    return interaction.followUp({ ephemeral: true,
    embeds: [
    {
    color: 0x6787e7,
    author: {
    name: `${interaction.user.tag}`,
    icon_url: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
    
    },
    // footer: { icon_url: client.user.displayAvatarURL() },
    footer: {
    text: `${client.user.username}`,
    icon_url: `${client.user.displayAvatarURL()}`,
    },
    
    description: `You're missing the \`MANAGE_GUILD\` permission`,
    timestamp: new Date(),
    },
    ],
    });
    const Embed = new MessageEmbed();
    Embed.setColor(Color);

    const Channel = options.getChannel("channel");
    const Threshold = options.getNumber("threshold");
    const Content = options.getString("text");
await interaction.deferReply()
    try {
      switch(options.getSubcommand()) {
        case "create": 
        StickyDB.findOne({ GuildID: guildId, ChannelID: Channel.id }, async (err, data) => {
          if (err) throw err;
          if(data) {
          return interaction.followUp({ embeds: [Embed.setDescription(`${emoji.error} There is already a sticky message attached to this channel!`)]})
        } else {
            StickyDB.create({
            GuildID: guildId,
            ChannelID: Channel.id,
            Message: Content,
            Threshold: Threshold -1,
            CreatedBy: member.id,
            MessageCount: 0,
          });

         Embed.setDescription(`${emoji.success} Successfully added a sticky message!`)
         Embed.addFields(
            { name: "Channel:", value: `${Channel}`, inline: true },
            { name: "Message Threshold:", value: `${Threshold}`, inline: true },
            { name: "Message:", value: `${Content}` })
        interaction.followUp({
          embeds: [Embed], ephemeral: true
        });
        Channel.send({ embeds: [new MessageEmbed().setTitle(`Sticky Message`).setDescription(`${Content}`)] }).then(async (stickmsg) => {
          const DB = await StickyDB.findOne({ GuildID: guildId, ChannelID: Channel.id })
          DB.Lastmsg = stickmsg.id;
          DB.save();
        })
        }})
        break;

        case "remove":
        StickyDB.findOne({ GuildID: guildId, ChannelID: Channel.id }, async(err, data) => {
          if (err) throw err;
          if (data) {
            await StickyDB.deleteOne({ GuildID: guildId, ChannelID: Channel.id })
              interaction.followUp({ embeds: [Embed.setDescription(`${emoji.success} Successfully deleted the sticky message for ${Channel}`)], ephemeral: true })
          } else {
            interaction.followUp({ embeds: [Embed.setDescription(`${emoji.error} There is no sticky message applied to ${Channel}`)], ephemeral: true })
          }
        })
        break;

        case "list":
        StickyDB.find({ GuildID: guildId }, async (err, data) => {
          if(err) throw err;
          if (!data.length) return interaction.followUp({ embeds: [Embed.setDescription(`${emoji.error} No sticky messages found.`)], ephemeral: true })
          if(data) {
            Embed.setDescription(`${data.map(
          (w, i) => `**Channel**: <#${w.ChannelID}> (**ID**: ${w.ChannelID})\n**Threshold**: ${w.Threshold +1}\n**Created By**: <@${w.CreatedBy}>\n**Content**: ${w.Message}
          \n`
        ).join(" ")}`)
        interaction.followUp({ embeds: [Embed], ephemeral: true })
          }
        })
        break;
      }
    } catch (err) {
      console.log(err)
    }
  },
};