<script setup lang="ts">
defineProps<{name:string}>();
const paths:Record<string,string>={home:'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',news:'M5 3h14v18H5zM8 7h8M8 11h8M8 15h3M8 18h8',newsroom:'M3 5h18v15H3zM3 9h18M7 13h4v4H7zM14 13h4M14 17h4',races:'M5 22V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0',profile:'M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 21v-2a8 8 0 0 1 16 0v2',data:'M4 20h17M6 16V9m6 7V4m6 12v-5',forum:'M3 4h18v13H9l-5 4v-4H3zM7 9h10M7 13h6'};
</script>
<template><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path :d="paths[name]||paths.home"/></svg></template>
