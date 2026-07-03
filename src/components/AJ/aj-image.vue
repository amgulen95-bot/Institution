<template>
    <div class="aj-image" :style="{ height: height + 'px', width: width + 'px' }">
        <a-image :src="url" :fallback="DEFAULTEMPTYIMAGEURL" placeholder :preview="preview" :height="height"
            :width="width" />
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, nextTick, onMounted, watch } from 'vue';

import { DEFAULTEMPTYIMAGEURL } from '/@/utils/common'

export default defineComponent({
    name: 'aj-image',
    components: {},
    props: {
        height: {
            type: Number,
            default: 90
        },
        width: {
            type: Number,
            default: 90
        },
        src: {
            type: String,
            default: DEFAULTEMPTYIMAGEURL
        },
        alt: {
            type: String,
            default: ''
        },
        preview: {
            type: Boolean,
            default: false
        }
    },
    setup(props, context) {

        // data
        const url = ref('')

        // 生命周期
        onMounted(() => {
            nextTick(() => {
                if (props.src) {
                    url.value = props.src
                }
            })
        })

        // 计算,监听
        watch(() => props.src, (val) => {
            url.value = val
        })
        return {
            DEFAULTEMPTYIMAGEURL,
            url,
        };
    },
});
</script>
<style scoped>
.aj-image {
    overflow: hidden;
    border-radius: 4px;
}
</style>
