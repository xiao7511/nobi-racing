<script setup lang="ts">
import {computed} from 'vue';import {useI18n} from 'vue-i18n';import {forumUnread} from '../stores/community';
const {locale}=useI18n(),zh=computed(()=>locale.value==='zh-CN');
</script>
<template><section class="forum-home-entry"><div class="forum-home-symbol" aria-hidden="true">🏁</div><div><p class="eyebrow">PADDOCK CHAT</p><h2>{{zh?'车迷围场，一起聊比赛':'Your paddock, your conversation'}}</h2><p>{{zh?'开个话题，用表情和引用回复分享你的看法。':'Start a topic, share a sticker and reply to fellow fans.'}}</p></div><div class="forum-home-actions"><RouterLink class="button primary" to="/forum">{{zh?'进入论坛':'Join the forum'}} →</RouterLink><RouterLink v-if="forumUnread" class="button" to="/forum?inbox=1">{{zh?'回复消息':'Replies'}} · {{forumUnread}}</RouterLink></div></section></template>
