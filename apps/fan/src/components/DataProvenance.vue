<script setup lang="ts">
import { usePage } from '../composables/usePage';
import type { ApiSchemas } from '../api/client';
defineProps<{ facts?: { provenance: ApiSchemas['Phase2Provenance']; updatedAt: string; dataStatus: string }; snapshotId?: string | null }>();
const { t, date } = usePage();
</script>
<template><aside v-if="facts" class="source-note"><span class="mock-pill">MOCK</span> {{ facts.provenance.attribution }}<br/>{{ t('api.fetched') }}: {{ date(facts.provenance.fetchedAt) }} · {{ t('common.updated') }}: {{ date(facts.updatedAt) }}<br/>{{ t('api.sourceZone') }}: {{ facts.provenance.timeZone }} · {{ t('api.dataStatus') }}: {{ t('api.status.' + facts.dataStatus) }}<span v-if="snapshotId"><br/>{{ t('api.snapshot') }}: {{ snapshotId }}</span></aside></template>
