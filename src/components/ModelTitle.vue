<template>
    <div class="modal-title">
        <div>{{title || ''}}</div>
        <img @click="closeModel" style="width: 26px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADMSURBVHgB7ZU7DoMwDEDtbGycoLKYUKf2CNyMo3ATjkDHjj4CW9Wlbq3+hnxwJIQY8qaIxH5xZBmAQsECEdVrnXXRwObYC1YTUUuwKGlJXDUdmraPncFw4KkWd590CQKMIh3zleMSHP9nb2dmnsFSEfNlxod0unxdhQRxDFXmS/RCviRaUTrRu7LUXrYollC/50hMopDsE2WWmEWeTMmQKA42wiTynm6hG0Psoxk2aW9LohzZHkYQDpYn0b3vuBKRITaCkqz5mygUfjwB3/rZldtRSOQAAAAASUVORK5CYII=" alt="">
    </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['close'])
const props = defineProps<{title: string}>()
function closeModel() {
    emit('close',false)
}
</script>
  
<style></style>