import {ref, computed} from 'vue'
import {useSessionStorage} from '@vueuse/core'
import {supabase} from '../supabaseClient';
import axios from 'axios';

// const toast = useToast()


interface errorResponse {
    name: string;
}

type firstOutput = {
    error: string,
    details: {
        success: boolean,
        message: string | ''
    }
}

type secondaryOutput = {
    success: boolean,
    validated: boolean,
    message: string
    attempts: number
}

type payLoad = {
    email: string,
    createRow: boolean
}

type secondaryPayload = {
    email: string,
    userPinInput: string,
}
type userAttributes = {
    id?: number
    created_at?: string
    email?: string
    usernameID?: string
    authUID?: string
    profileColor?: string
    displayName?: string
    degree?: string
    alumni?: boolean
}



export function auth() {
    let authListener = null;
    const sentPin = ref<boolean>(false);
    const verificationStatus = ref<boolean>(false);
    const verificationPin = ref<[]>([]);
    const firstOutput = ref<firstOutput | null>(null);
    const secOutput = ref<secondaryOutput | null>(null);
    const currentPage = ref<number>(0);
    const baitField = ref<string>('');
    const loading = ref<boolean>(false);
    const loadingSecondary = ref<boolean>(false);

    const allowedDomains = [
        'sit.singaporetech.edu.sg',   // Singapore Institute of Technology (SIT) student emails
    ];
    const errorMsg = ref('');
    const currentUser = useSessionStorage('user', {access_token: null});
    const userAttributes = useSessionStorage<userAttributes>('userAttributes', {})
    const email = ref<string>('');
    const password = ref<string>('');
    const displayName = ref<string>('');
    const usernameID = ref<string>('');
    const degree = useSessionStorage('degree', '')
    const alumniBool = ref<boolean>(false)


    // const getUser = async () => {
    //     const { data: { user }, error } = await supabase.auth.getUser()

    //     if (error) {
    //         console.error('Error fetching user:', error.message)
    //         return null
    //     }
    //     if (user) {
    //         currentUser.value = user;
    //         // return user
    //     } else {
    //         console.log('No user is currently logged in.')
    //         return null
    //     }
    // }

    const getUserTesting = async (accessToken: string) => {
        const tempVariable = await (supabase.auth.getUser(accessToken));
        console.log(tempVariable);
        return tempVariable;

    }
    const initiateUser = async () => {

        const {data} = await supabase.auth.getSession()
        currentUser.value = data.session

        if (!authListener) {
            const {data} = supabase.auth.onAuthStateChange((event, session) => {
                currentUser.value = session

                if (event === 'TOKEN_REFRESHED') {
                    console.log('[auth] Token refreshed')
                }

                if (event === 'SIGNED_OUT') {
                    console.log('[auth] User signed out')
                }
            })
            authListener = data
        }
    }

    const fetchAttributes = async (force = false) => {
        try {
            if ((Object.keys(userAttributes.value).length === 0 || force) && currentUser.value?.access_token) {
                console.log("here")
                const {data, error} = await supabase
                    .from('users')
                    .select(`*`)
                    .eq('authUID', currentUser.value.user?.id)
                    .single();

                // Handle potential error
                if (error) {
                    // console.error("Error fetching user attributes:", error);
                    return null;
                }
                userAttributes.value = data;
                displayName.value = data?.user_id || '';
                usernameID.value = data?.last_name || '';
                email.value = data?.email || '';
                degree.value = data?.degree || '';
                return data;
            }


            return userAttributes.value;
        } catch (err) {
            console.error("Unexpected error fetching user attributes:", err);
            return null;
        }
    }


    const unsubscribeAuthListener = () => {
        if (authListener) {
            authListener.subscription.unsubscribe()
            authListener = null
        }
    }
    const logout = async () => {
        unsubscribeAuthListener()
        currentUser.value = {}
        userAttributes.value = {}
        sessionStorage.clear()
        localStorage.clear()
        const response = await supabase.auth.signOut()
        if (!response.error) {
            window.location.href = '/signup'
        }
    }

    const login = async () => {
        console.log(Object.keys(currentUser.value).length)
        if (currentUser.value?.access_token != null) {
            await logout();
            return;
        }
        try {
            loading.value = true;
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email.value,
                password: password.value
            });

            if (error) {
                console.error('Login failed:', error);
                loading.value = false;

                switch (error.message) {
                    case 'Invalid login credentials':
                        errorMsg.value = 'Incorrect email or password, please try again.';
                        break;
                    case 'Email not confirmed':
                        errorMsg.value = 'Please verify your email before logging in.';
                        break;
                    case 'Invalid email':
                        errorMsg.value = 'Please enter a valid email address.';
                        break;
                    case 'Password should be at least 6 characters':
                        errorMsg.value = 'Password should be at least 6 characters.';
                        break;
                    case 'Rate limit exceeded':
                        errorMsg.value = 'Too many login attempts. Please try again later.';
                        break;
                    default:
                        errorMsg.value = `Authentication error: ${error.message}`;
                }
            } else if (data.session) {
                loading.value = false;
                window.location.href = '/';
            } else {
                // This case should rarely happen, but handling it just in case
                errorMsg.value = 'Login failed. Please try again.';
                loading.value = false;
            }
        } catch (error: errorResponse) {
            console.error('Unexpected error during login:', error);
            if (error.name === 'AxiosError' && error.response?.status === 401) {
                errorMsg.value = 'Incorrect email or password, please try again.';
            } else if (error.name === 'AxiosError' && error.response?.status === 429) {
                errorMsg.value = 'Too many requests. Please try again later.';
            } else if (error.name === 'NetworkError' || error.message?.includes('network')) {
                errorMsg.value = 'Network error. Please check your connection and try again.';
            } else {
                errorMsg.value = 'An unexpected error occurred. Please try again later.';
            }
        }
    }

    const checkEmail = async () => {
        console.log("Sending Pin..")
        const axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        try {
            const body: payLoad = {
                email: email.value,
                createRow: true
            }
            console.log(body)
            const res = await axios.post(
                `https://wzhptihlng.execute-api.ap-southeast-1.amazonaws.com/default/`,
                JSON.stringify(body),
                axiosConfig
            );
            firstOutput.value = res.data;
            console.log(firstOutput.value)

        } catch (err) {
            firstOutput.value = {
                error: 'Unexpected error',
                details: err?.response?.data || err.message || err
            }
            console.error(firstOutput.value);
        }
    }

    const submitPin = async () => {
        try {
            loadingSecondary.value = true;

            const axiosConfig = {
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            const body: secondaryPayload = {
                email: email.value,
                userPinInput: verificationPin.value.join(''),
            }
            const res = await axios.post(`https://gibhy63v4i.execute-api.ap-southeast-1.amazonaws.com/default/`,
                JSON.stringify(body),
                axiosConfig
            );
            secOutput.value = res.data
            if (secOutput.value?.success) {
                currentPage.value++
            }
            if (res.data.success) {
                verificationStatus.value = true
            } else {
                verificationStatus.value = false
                verificationPin.value = []

            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            loadingSecondary.value = false;
        }
    }

    const randomDarkHex = () => {
        const max = 150;

        const r = Math.floor(Math.random() * max);
        const g = Math.floor(Math.random() * max);
        const b = Math.floor(Math.random() * max);

        const toHex = (n: number) => n.toString(16).padStart(2, "0");

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    const signUp = async () => {
        console.log("Attempting sign up");

        if (baitField.value !== '') {
            return;
        }
        try {
            const {data: newUser, error: signUpError} =
                await supabase.auth.signUp({
                    email: email.value,
                    password: password.value
                })

            if (signUpError) {
                console.error('Sign-up error:', signUpError.message)
                return
            }
            const getRandomColor = randomDarkHex();

            const userData = {
                authUID: newUser?.user?.id,
                usernameID: usernameID.value.trim(),
                displayName: displayName.value.trim(),
                email: String(email.value).trim().toLowerCase(),
                degree: '',
                profileColor: getRandomColor,
                alumni: false,
            }
            console.log(userData);

            userData.degree = degree.value

            const {error: insertError} = await supabase
                .from('users')
                .insert(userData)

            if (insertError) {
                console.error(
                    'Error inserting user into database:',
                    insertError.message
                )
                return
            }
            // toast.add({
            //     title: 'Success!',
            //     description: `Profile created successfully.`,
            //     color: 'secondary',
            //     icon: `lucide:check-circle`
            // })
            const {data: signInData, error: signInError} =
                await supabase.auth.signInWithPassword({
                    email: email.value,
                    password: password.value
                })
            if (signInError) {
                console.error('Sign-in error:', signInError.message)
                return
            }
            if (signInData.session) {
                window.location.href = '/'
            } else {
                console.error('Failed to establish a session after sign-in.')
                // toast.add({
                //     title: 'Error',
                //     description: `Failed to establish session!`,
                //     color: 'error',
                //     icon: `lucide:alert-circle`
                // })
            }
        } catch (error) {
            console.error('Unexpected error during sign-up or sign-in:', error)
        }
    }


    const checkUsername = async (usernameID: string) => {
        const {data, error} = await supabase.from('users').select('usernameID').eq('usernameID', usernameID).single();
        if (data?.usernameID) {
            return false
        } else {
            return true
        }

    }
    return {
        //Variables
        baitField,
        allowedDomains,
        sentPin,
        verificationStatus,
        verificationPin,
        email,
        password,
        degree,
        loading,
        loadingSecondary,
        displayName,
        usernameID,
        alumniBool,
        currentUser,
        userAttributes,
        firstOutput,
        secOutput,
        errorMsg,
        currentPage,


        //Functions
        getUserTesting,
        randomDarkHex,
        login,
        logout,
        checkEmail,
        signUp,
        submitPin,
        checkUsername,
        initiateUser,
        fetchAttributes
    }

}
