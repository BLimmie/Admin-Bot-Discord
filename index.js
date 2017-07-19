const Discord = require('discord.js');
const Timer = require('timer.js');
const bot = new Discord.Client();
const PREFIX = '%';
// bot.registry.registerGroup('random', 'Random');
// bot.registry.registerDefaults();
// bot.registry.registerCommandsIn(__dirname + "/commands");
function silencio(guild, userid){
    var allChannels = guild.channels.array();
    for(i = 0; i < allChannels.length; ++i){
        allChannels[i].overwritePermissions(
            userid,
            {
                SEND_MESSAGES: false
            }
        );
    }
}
function unsilence(guild, userid){
    var allChannels = guild.channels.array();
    for(i = 0; i < allChannels.length; ++i){
        allChannels[i].overwritePermissions(
            userid,
            {
                SEND_MESSAGES: null
            }
        );
    }
}
bot.on('message', (message) =>{
    if(message.content.startsWith(PREFIX)){
        var s = message.content.split(' ');
        if(s[0] == '%SILENCIO'){
            if (message.channel.permissionsFor(message.author).has("KICK_MEMBERS")) {
                try{
                    if(!(s[2].startsWith('<') && s[2].endsWith('>'))){
                        throw 2;
                    }
                    if(!(0<s[1]&&s[1]<61)){
                        throw 1;
                    }
                    var timeoutTimer = new Timer(
                        {
                            onstart: function() {silencio(message.guild, s[2].substring(2,s[2].length-1))},
                            onend: function() {unsilence(message.guild, s[2].substring(2,s[2].length-1))}
                        }
                    );
                    var timeout = s[1]*60;
                    timeoutTimer.start(timeout);
                    var smite = "A sandal flies out of nowhere and strikes " + 
                        s[2] + 
                        " in the jaw, rendering him unable to speak for " +
                        s[1] +
                        " minute";
                    if(s[1] != 1){
                        smite += "s.";
                    }
                    else{
                        smite += ".";
                    }
                    message.channel.send(
                        smite
                    );
                } catch(e){
                    if(e == 1){
                        message.channel.send('Invalid amount of time');
                    }
                    else{
                        message.channel.send("Usage is: %SILENCIO [time(min)] [Tag user]");
                    }
                }
            } else {
                message.reply(
                    "You must build additional pylons."
                );
            }
            
        }
    }
});

bot.login('MzM2MzU2MzYzNjYxNzM3OTg0.DE3pew.A1RVEnBz6nAtm8dx7EmL6LZ4FCk');
