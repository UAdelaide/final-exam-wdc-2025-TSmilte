const { createApp, ref, reactive } = Vue;

createApp({
    setup() {
        const user = ref(null);
        const page = ref('login');
        const form = reactive({ username: '', email: '', password: '', role: 'owner' });
        const walkRequests = ref([]);
        const newDog = reactive({ name: '', size: 'small' });
        const newRequest = reactive({ dog_id: '', requested_time: '', duration_minutes: '', location: '' });
        const newRating = reactive({
            request_id: '',
            walker_id: '',
            owner_id: '',
            rating: 5,
            comments: ''
        });

        // For applications management
        const applications = ref([]);
        const selectedRequestId = ref(null);

        // Signup
        const signup = async () => {
            try {
                await axios.post('/api/users/signup', form);
                alert('Signup successful! Please log in.');
                page.value = 'login';
            } catch (err) {
                alert('Signup failed: ' + (err.response?.data?.error || err.message));
            }
        };

        // Login
        const login = async () => {
            try {
                const res = await axios.post('/api/users/login', form);
                user.value = res.data.user;
                page.value = 'dashboard';
                loadWalkRequests();
            } catch (err) {
                alert('Login failed: ' + (err.response?.data?.error || err.message));
            }
        };

        // Logout
        const logout = () => {
            user.value = null;
            page.value = 'login';
            applications.value = [];
            selectedRequestId.value = null;
        };

        // Load walk requests
        const loadWalkRequests = async () => {
            const res = await axios.get('/api/requests');
            walkRequests.value = res.data;
        };

        // Add a dog
        const addDog = async () => {
            try {
                await axios.post('/api/dogs', { owner_id: user.value.user_id, ...newDog });
                alert('Dog added!');
            } catch (err) {
                alert('Failed to add dog: ' + (err.response?.data?.error || err.message));
            }
        };

        // Post a walk request (owner)
        const postWalkRequest = async () => {
            try {
                await axios.post('/api/requests', { ...newRequest });
                alert('Request posted!');
                loadWalkRequests();
            } catch (err) {
                alert('Failed to post request: ' + (err.response?.data?.error || err.message));
            }
        };

        // Apply to walk (walker)
        const applyToWalk = async (request_id) => {
            try {
                await axios.post('/api/applications', { request_id, walker_id: user.value.user_id });
                alert('Applied!');
            } catch (err) {
                if (err.response && err.response.data && err.response.data.error && err.response.data.error.includes('Duplicate entry')) {
                    alert('You have already applied to this walk request.');
                } else {
                    alert('Failed to apply: ' + (err.response?.data?.error || err.message));
                }
            }
        };

        // Load applications for a walk request
        const loadApplications = async (request_id) => {
            selectedRequestId.value = request_id;
            const res = await axios.get(`/api/applications/request/${request_id}`);
            applications.value = res.data;
        };

        // Accept a walker
        const acceptWalker = async (request_id, walker_id) => {
            try {
                await axios.post('/api/requests/accept', { request_id, walker_id });
                alert('Walker accepted!');
                applications.value = [];
                selectedRequestId.value = null;
                loadWalkRequests();
            } catch (err) {
                alert('Failed to accept walker: ' + (err.response?.data?.error || err.message));
            }
        };

        // Deny a walker
        const denyWalker = async (request_id, walker_id) => {
            try {
                await axios.post('/api/requests/deny', { request_id, walker_id });
                alert('Walker denied.');
                loadApplications(request_id);
            } catch (err) {
                alert('Failed to deny walker: ' + (err.response?.data?.error || err.message));
            }
        };

        const submitRating = async () => {
            try {
                await axios.post('/api/ratings', { ...newRating, owner_id: user.value.user_id });
                alert('Rating submitted!');
                // Optionally clear form
                newRating.request_id = '';
                newRating.walker_id = '';
                newRating.rating = 5;
                newRating.comments = '';
            } catch (err) {
                alert('Failed to submit rating: ' + (err.response?.data?.error || err.message));
            }
        };


        return {
            user, page, form, signup, login, walkRequests, loadWalkRequests,
            addDog, newDog, postWalkRequest, newRequest, applyToWalk,
            logout, applications, selectedRequestId, loadApplications,
            acceptWalker, denyWalker, newRating, submitRating
        };
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
        <!-- Owner's Walk Requests -->
        <h3>Your Walk Requests</h3>
        <ul>
          <li v-for="req in walkRequests.filter(r => r.owner_id === user.user_id)" :key="req.request_id">
            Dog: {{ req.dog_name }} | Time: {{ req.requested_time }} | Location: {{ req.location }}
            <button @click="loadApplications(req.request_id)">View Applications</button>
          </li>
        </ul>
        <div v-if="applications.length && selectedRequestId">
          <h4>Applications for Request #{{ selectedRequestId }}</h4>
          <ul>
            <li v-for="app in applications" :key="app.application_id">
              Walker: {{ app.username }} | Status: {{ app.status }}
              <button v-if="app.status === 'pending'" @click="acceptWalker(selectedRequestId, app.walker_id)">Accept</button>
              <button v-if="app.status === 'pending'" @click="denyWalker(selectedRequestId, app.walker_id)">Deny</button>
            </li>
          </ul>
        </div>
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
        <div v-if="user.role === 'owner'">
          <!-- Other owner features ... -->
          <h3>Rate Completed Walk</h3>
          <input v-model="newRating.request_id" placeholder="Walk Request ID"><br>
          <input v-model="newRating.walker_id" placeholder="Walker ID"><br>
          <input v-model.number="newRating.rating" type="number" min="1" max="5" placeholder="Rating (1-5)"><br>
          <textarea v-model="newRating.comments" placeholder="Comments"></textarea><br>
          <button @click="submitRating">Submit Rating</button>
        </div>
    </div>
  `
}).mount('#app');
