<script setup lang="ts">
const router = useRouter().currentRoute.value.params.community;

</script>

<template>
  <div>
    <pre>
      {{router}}
    </pre>
  </div>
</template>

<style scoped>

</style>