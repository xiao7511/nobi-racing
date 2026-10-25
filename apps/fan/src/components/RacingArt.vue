<script setup lang="ts">
withDefaults(defineProps<{ kind?: string }>(), { kind: 'velocity' });
</script>
<template><div class="racing-art" :class="kind" aria-hidden="true"><svg viewBox="0 0 600 340" fill="none"><path class="art-line faint" d="M-60 270 160 50h160l135 140h180"/><path class="art-line" d="M-60 310 180 70h130l130 140h220"/><path class="art-track" d="m75 220 90-115h145l80 65 100 15-35 60-130-10-70 35-110-5Z"/><path class="art-car" d="M120 232 135 210 202 200 218 173h60l22 27 69 13 57 13h22v12H120ZM125 190h65v12h-65Z"/><path class="art-wing" d="m154 203 6 28m59-58 13 33h65m-78 15 88 4 60 10m64-9v12"/><circle cx="186" cy="235" r="24"/><circle cx="382" cy="235" r="24"/></svg><span class="art-number">27</span></div></template>
