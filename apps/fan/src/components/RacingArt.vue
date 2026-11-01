<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {assetUrl} from '../lib/urls';
import { photos } from '../content/photos';
const props = withDefaults(defineProps<{ kind?: string }>(), { kind: 'velocity' });
const { locale, t } = useI18n();
const photo = computed(() => props.kind === 'engineering' ? photos.audi : photos.ferrari);
const failed = ref(false);
</script>
<template><figure class="racing-art racing-photo" :class="kind"><img v-if="!failed" :src="assetUrl(photo.src)" :alt="locale === 'zh-CN' ? photo.altZh : photo.alt" width="1920" height="1280" loading="lazy" decoding="async" @error="failed = true"/><p v-else class="photo-error">{{ t('legal.imageUnavailable') }}</p><figcaption>{{ photo.author }} · {{ photo.license }} · {{ t('legal.archivePhoto') }}</figcaption></figure></template>
