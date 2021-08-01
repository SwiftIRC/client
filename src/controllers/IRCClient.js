import { ref } from 'vue'
import sha256 from 'js-sha256'
import * as IRC from 'irc-framework'

const shared = ref({
    config: {
        nick: 'SwiftGuest' + Math.floor(Math.random() * 10000),
        channels: '#asdfghj'
    },
    isActive: false,
    active: "Status",
    isSidebarOpen: false,
    bot: new IRC.Client(),
    buffers: [],
    messages: {}
})

export default function IRCClient() {
    const connect = () => {
        shared.value.isActive = true

        document.getElementById('menuButton').click()

        shared.value.bot.connect({
            host: 'irc.swiftirc.net',
            nick: shared.value.config.nick,
            username: 'swift',
            gecos: 'SwiftIRC Guest: ' + shared.value.config.nick,
            port: 4443,
            tls: true,
            autoReconnect: true
        })

        shared.value.bot.on('registered', () => {
            shared.value.buffers.push({ name: "Status" })

            shared.value.config.channels.split(',').forEach(channel => {
                const chan = shared.value.bot.channel(channel)

                chan.join()
            })
        })

        shared.value.bot.on('privmsg', (event) => {
            console.log(event)
            let chan = event.target
            if (chan === undefined) {
                chan = 'Status'
            }
            if (shared.value.messages[chan] === undefined) {
                shared.value.messages[chan] = []
            }

            shared.value.messages[chan].push(event)
        })

        shared.value.bot.on('notice', (event) => {
            const chan = 'Status'

            if (shared.value.messages[chan] === undefined) {
                shared.value.messages[chan] = []
            }

            shared.value.messages[chan].push(event)
        })

        shared.value.bot.on('join', (event) => {
            if (shared.value.messages[event.channel] === undefined) {
                shared.value.messages[event.channel] = []
            }

            event.event = 'join'

            shared.value.messages[event.channel].push(event)

            if (event.nick === shared.value.config.nick) {
                shared.value.active = event.channel
            }

            const chan = shared.value.bot.channel(event.channel)

            if (shared.value.buffers.indexOf(chan) === -1) {
                shared.value.buffers.push(chan)
            }
        })

        shared.value.bot.on('part', (event) => {
            if (event.nick == shared.value.config.nick) {
                const chan = event.channel
                shared.value.messages[chan] = undefined

                shared.value.buffers.splice(shared.value.buffers.indexOf(chan), 1)

                shared.value.active = "Status"
            }
            else {
                event.event = 'part'

                shared.value.messages[event.channel].push(event)
            }
        })

        // shared.value.bot.on('quit', (event) => {
        // })

        // shared.value.bot.on('kick', (event) => {
        // })

        shared.value.bot.on('nick', (event) => {
            event.event = "nick"
            console.log(event)
        })

        shared.value.bot.on('raw', (event) => {
            console.log(event)
        })
    }

    const sendMessage = () => {
        const chan = shared.value.bot.channel(shared.value.active)

        const input = document.getElementById('input')

        if (input.value.length === 0) {
            return true
        }

        let message = input.value

        if (message.indexOf('/') === 0) {
            const space = message.indexOf(' ')
            let command, args, target
            if (space > 0) {
                command = message.substr(1, space - 1)
                args = message.substr(space + 1)
            }
            else {
                command = message.substr(1)
                args = ''
            }

            console.log(command)

            if (command === 'me') {
                target = args.split(' ')[0]
                message = args.substr(target.length + 1)
                chan.action(target, message)
            }
            else if (command === 'msg') {
                target = args.split(' ')[0]
                message = args.substr(target.length + 1)
                chan.say(target, message)
            }
            else if (command === 'ctcp') {
                chan.ctcpRequest(args)
            }
            else {
                shared.value.bot.raw(message.substr(1))
            }

            input.value = ""
            return true

        }

        if (chan.name !== 'Status') {
            input.value = ""

            shared.value.bot.say(shared.value.active, message)

            shared.value.messages[shared.value.active].push({
                tags: {
                    msgid: sha256(new Date().getTime() + shared.value.bot.user.nick + message),
                    timestamp: new Date().getTime()
                },
                target: shared.value.active,
                time: new Date().getTime(),
                hostname: shared.value.bot.user.host,
                gecos: shared.value.bot.user.gecos,
                nick: shared.value.bot.user.nick,
                ident: shared.value.bot.user.ident,
                message: message,
                account: shared.value.bot.user.account
            })
        }
    }

    return { shared, connect, sendMessage }
}