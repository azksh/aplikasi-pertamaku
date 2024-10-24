<script setup>
import { ref } from 'vue';
import CommentSection from './components/CommentSection.vue';

// Regular expression for validating email format
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // <-- Added email validation pattern

const userId = ref('');
const users = ref(null);
const newEmail = ref('');
const emailError = ref('');  // <-- Added reactive property for email error message

const getUser = async () => {
  // Validate userId: Ensure it's a number
  const id = Number(userId.value);  // <-- Convert userId to number
  if (isNaN(id) || id <= 0) {  // <-- Check if userId is a valid positive integer
    alert('Please enter a valid User ID.');  // <-- Alert for invalid user ID
    return;
  }
  
  const response = await fetch(`http://localhost:3000/api/user/${id}`);
  users.value = await response.json();
};

const changeEmail = async () => {
  // Validate email format
  if (!emailPattern.test(newEmail.value)) {  // <-- Validate email using regex
    emailError.value = 'Please enter a valid email address.';  // <-- Set error message for invalid email
    return;
  } else {
    emailError.value = '';  // <-- Clear error message if email is valid
  }

  await fetch('http://localhost:3000/api/change-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `email=${encodeURIComponent(newEmail.value)}`,  // <-- Sanitize email input
  });
};
</script>

<template>
  <div id="app">
    <h1>User Dashboard</h1>
    <div>
      <input v-model="userId" placeholder="Enter User ID" />
      <button @click="getUser">Get User Info</button>
    </div>
    <div v-if="users">
      <template v-for="user in users">
        <h2>{{ user.name }}</h2>
        <p>Email: {{ user.email }}</p>
        <hr />
      </template>
    </div>
    <CommentSection />
    <form @submit.prevent="changeEmail">
      <h3>Change Email</h3>
      <input v-model="newEmail" placeholder="New Email" />
      <p v-if="emailError" style="color: red;">{{ emailError }}</p>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>