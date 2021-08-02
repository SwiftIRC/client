<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button id="menuButton" color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>SwiftIRC • {{ shared.active }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ shared.active }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container" :class="{ hidden: shared.isActive }">
        <input type="text" id="nick" placeholder="Nickname" v-model="shared.config.nick" class="rounded-sm border-2 shadow-inner my-1 px-1"><br>
        <input type="text" id="channels" placeholder="Channels" v-model="shared.config.channels" class="rounded-sm border-2 shadow-inner my-1 px-1"><br>
        <button @click="connect(config, buffers, messages);" class="rounded-full shadow bg-purple-500 text-white px-3 py-1 my-1">Connect</button><br><br>
      </div>
      <div id="text" :class="{ hidden: !shared.isActive }" v-for="message in shared.messages[shared.active]" :key="message.tags.msgid">
        <!-- { "account": false, "nick": "SwiftGuest2017", "ident": "~swift", "hostname": "Swift-4D1062C2.hsd1.co.comcast.net", "gecos": "SwiftIRC Guest: SwiftGuest2017", "channel": "#asdfghj", "time": 1627742064758, "tags": { "msgid": "y1AMGdqWily6kzxPRi6Sos-m+qXgaWjo55zRduWkwmRRA", "time": "2021-07-31T14:34:24.758Z" }, "event": "join" } -->
        {{ message.event == "join" ? message.nick + " has joined " + message.channel : "" }}
        {{ message.event == "part" ? message.nick + " has left " + message.channel + (message.message !== undefined ? ": " + message.message : "") : "" }}
        {{ message.event == "quit" ? message.nick + " has disconnected" + (message.message !== undefined ? ": " + message.message : "") : "" }}
        {{ message.event == "kick" ? message.kicked + " has kicked from " + message.channel + " by " + message.nick + (message.message !== undefined ? ": " + message.message : "") : "" }}
        {{ message.event == "nick" ? message.nick + " is now known as " + message.new_nick : "" }}

        {{ message.message !== undefined ? message.nick !== "" ? "&lt;" + message.nick + "&gt; " + message.message : message.message : ""  }}
      </div>
      <div class="flex flex-row bottom-0 absolute w-full" :class="{ hidden: !shared.isActive }">
        <input id="input" class="rounded-sm border-2 shadow-inner px-2 my-3 w-full"
                v-on:keydown="keydown">
        <button class="rounded-lg shadow bg-purple-500 text-white px-3 py-1 mx-2 my-1"
                @click="sendMessage()">Send</button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="js">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';

import IRCClient from '../controllers/IRCClient.js';

export default {
  name: 'Folder',
  components: {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar
  },
  setup() {
    const { shared, connect, sendMessage } = IRCClient();

    const keydown = (event) => {
      if (event.key == "Enter") {
        sendMessage()
      }
    }

    return {
      shared,
      connect,
      sendMessage,
      keydown
    }
  }
}
</script>

<style scoped>
.hidden {
  display: none;
}
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}

input {
  color: black;
}
</style>