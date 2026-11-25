<template>
    <h1>login</h1>
</template>

<script setup>
import { login } from '../api/user'
import { onMounted } from 'vue'
onMounted(()=>{
    login({username: 'admin',password: 'admin123'})
})
</script>