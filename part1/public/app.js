const { createApp, ref, reactive } = Vue;

createApp({
  setup() {
    const user = ref(null);
    const page = ref('login');
    const form = reactive({ username: '', email: '', password: '', role: 'owner' });
    const walkRequests = ref([]);
    const newRequest = reactive({ dog_id: '', requested_time: '', duration_minutes: '', location: '' });

    // Signup
    const signup = async () => {
      await axios.post('http://localhost:3000/api/users/signup', form);
      page.value = 'login';
    };

    // Login
    const login = async () => {
      const res = await axios.post('http://localhost:3000/api/users/login', form);
      user.value = res.data.user;
      page.value = 'dashboard';
      loadWalkRequests();
    };

    // Load walk requests
    const loadWalkRequests = async () => {
      const res = await axios.get('http://localhost:3000/api/requests');
      walkRequests.value = res.data;
    };

    // Post a walk request (owner)
    const postWalkRequest = async () => {
      await axios.post('http://localhost:3000/api/requests', { ...newRequest, owner_id: user.value.user_id });
      loadWalkRequests();
    };

    return { user, page, form, signup, login, walkRequests, loadWalkRequests, postWalkRequest, newRequest };
  },
  template: `
    <div v-if="page === 'login'">
      <h2>Login</h2>
      <input v-model="form.username" placeholder="Username"><br>
      <input v-model="form.password" placeholder="Password" type="password"><br>
      <button @click="login">Login</button>
      <button @click="page='signup'">Sign up</button>
    </div>
    <div v-else-if="page === 'signup'">
      <h2>Sign Up</h2>
      <input v-model="form.username" placeholder="Username"><br>
      <input v-model="form.email" placeholder="Email"><br>
      <input v-model="form.password" placeholder="Password" type="password"><br>
      <select v-model="form.role">
        <option value="owner">Dog Owner</option>
        <option value="walker">Walker</option>
      </select><br>
      <button @click="signup">Sign up</button>
      <button @click="page='login'">Back to login</button>
    </div>
    <div v-else-if="page === 'dashboard'">
      <h2>Welcome, {{ user.username }}</h2>
      <button @click="loadWalkRequests">Load Walk Requests</button>
      <div v-if="user.role === 'owner'">
        <h3>Post Walk Request</h3>
        <input v-model="newRequest.dog_id" placeholder="Dog ID"><br>
        <input v-model="newRequest.requested_time" placeholder="YYYY-MM-DD HH:MM"><br>
        <input v-model="newRequest.duration_minutes" placeholder="Duration in minutes"><br>
        <input v-model="newRequest.location" placeholder="Location"><br>
        <button @click="postWalkRequest">Post Request</button>
      </div>
      <h3>Walk Requests</h3>
      <ul>
        <li v-for="req in walkRequests" :key="req.request_id">
          Dog: {{ req.dog_id }}, Time: {{ req.requested_time }}, Location: {{ req.location }}
        </li>
      </ul>
    </div>
  `
}).mount('#app');
