const { createApp, ref, reactive } = Vue;

createApp({
    setup() {
        // Minimal reactive state
        const user = ref(null);
        const page = ref('login');
        const form = reactive({ username: '', email: '', password: '', role: 'owner' });
        const walkRequests = ref([]);
        const newDog = reactive({ name: '', size: 'small' });
        const newRequest = reactive({ dog_id: '', requested_time: '', duration_minutes: '', location: '' });

        // Signup
        const signup = async () => {
            await axios.post('/api/users/signup', form);
            page.value = 'login';
        };

        // Login
        const login = async () => {
            const res = await axios.post('/api/users/login', form);
            user.value = res.data.user;
            page.value = 'dashboard';
            loadWalkRequests();
        };

        const logout = () => {
            user.value = null;
            page.value = 'login';
        };


        // Load walk requests
        const loadWalkRequests = async () => {
            const res = await axios.get('/api/requests');
            walkRequests.value = res.data;
        };

        // Add a dog
        const addDog = async () => {
            await axios.post('/api/dogs', { owner_id: user.value.user_id, ...newDog });
            alert('Dog added!');
        };

        // Post a walk request (owner)
        const postWalkRequest = async () => {
            try {
                await axios.post('/api/requests', { ...newRequest });
                alert('Request posted!');
                loadWalkRequests();
            } catch (err) {
                alert('Failed to post request: ' + err.response?.data?.error || err.message);
            }
        };


        // Apply to walk (walker)
        const applyToWalk = async (request_id) => {
            await axios.post('/api/applications', { request_id, walker_id: user.value.user_id });
            alert('Applied!');
        };

        return { user, page, form, signup, login, walkRequests, loadWalkRequests, addDog, newDog, postWalkRequest, newRequest, applyToWalk, logout,
      acceptWalker, denyWalker  };
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
      <button @click="logout">Logout</button>
      <button @click="loadWalkRequests">Reload Walk Requests</button>
      <div v-if="user.role === 'owner'">
        <h3>Add Dog</h3>
        <input v-model="newDog.name" placeholder="Dog name"><br>
        <select v-model="newDog.size">
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select><br>
        <button @click="addDog">Add Dog</button>
        <h3>Post Walk Request</h3>
        <input v-model="newRequest.dog_id" placeholder="Dog ID"><br>
        <input v-model="newRequest.requested_time" placeholder="YYYY-MM-DD HH:MM"><br>
        <input v-model="newRequest.duration_minutes" placeholder="Duration in minutes"><br>
        <input v-model="newRequest.location" placeholder="Location"><br>
        <button @click="postWalkRequest">Post Request</button>
      </div>
      <h3>Available Walk Requests</h3>
      <ul>
        <li v-for="req in walkRequests" :key="req.request_id">
          Dog: {{ req.dog_name }} ({{ req.size }}) | Time: {{ req.requested_time }} | Location: {{ req.location }}
          <span v-if="user.role === 'walker'">
            <button @click="applyToWalk(req.request_id)">Apply</button>
          </span>
        </li>
      </ul>
    </div>
  `
}).mount('#app');
