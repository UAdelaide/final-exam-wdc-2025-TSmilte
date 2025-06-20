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
      await axios.post('/api/requests', { ...newRequest });
      loadWalkRequests();
    };

    // Apply to walk (walker)
    const applyToWalk = async (request_id) => {
      await axios.post
