<template>
  <div>
    <div ref="editor" class="quill-editor">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: 'bubble'
  },
  placeholder: {
    type: String,
    default: 'What\'s on your mind?' // default placeholder text
  }
})

const emit = defineEmits(['update:modelValue'])
const editor = ref(null)
let quillInstance = null

onMounted(() => {
  quillInstance = new Quill(editor.value, {
    theme: props.theme,
    placeholder: props.placeholder
  })

  quillInstance.root.innerHTML = props.modelValue

  quillInstance.on('text-change', () => {
    emit('update:modelValue', quillInstance.root.innerHTML)
  })
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (
      quillInstance &&
      newVal !== quillInstance.root.innerHTML
    ) {
      quillInstance.root.innerHTML = newVal
    }
  }
)
</script>

<style>
.ql-tooltip-editor {
  display: none !important;
}
.editor-wrapper {
  max-width: 300px; 
  width: 100%;
}

.quill-editor {
  min-height: 70px;
  overflow-wrap: break-word; /* wrap long words/text */
  word-break: break-word;    /* older browsers */
}
</style>
