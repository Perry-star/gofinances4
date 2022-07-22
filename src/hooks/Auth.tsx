import React, {  
    createContext, 
    ReactNode, 
    useContext,
    useEffect,
    useState,

} from 'react';

const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;

import * as AppleAuthentication from 'expo-apple-authentication';


import * as AuthSession from 'expo-auth-session';


import { SignIn } from '../screens/SignIn';
import AsyncStorageLib from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAsyncStorage } from '@react-native-async-storage/async-storage';


interface AuthProviderProps {
    children: ReactNode
}


interface  User {
    id: string;
    name: string;
    email: string;
    photo?: string;
}

interface IAuthContextData {
    user:User;
    SignInWithGoogle(): Promise<void>;
    SignInWithApple (): Promise<void>;
    SignOut (): Promise<void>;
    userStorageLoading: boolean;

}


interface AuthorizationResponse {
    params: {
        access_token: string;
    };
    type:string;
}

const AuthContext = createContext({} as IAuthContextData);


function AuthProvider({children}: AuthProviderProps) {
     const [ user, setUser] = useState<User>({} as User);
     const [ userStorageLoading, setUserStorageLoading] = useState(true);

     const userStorageKey = '@gofinances:user';

    async function  SignInWithGoogle (){
        try {
            const RESPONSE_TYPE = 'token';
            const SCOPE = encodeURI('profile email');

            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

            const {type, params} = await AuthSession
            .startAsync({ authUrl }) as AuthorizationResponse;
           
            if(type == 'success') {
                const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
                const userInfo = await response.json();

                setUser({
                    id:userInfo.id,
                    email: userInfo.email,
                    name: userInfo.given_name,
                    photo: userInfo.picture,
                })
            }

        } catch (error) {
            throw new Error(error);
        }
    }
    
    async function SignInWithApple () {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ]
            });

            if(credential){

                const name = credential.fullName!.givenName!;
                const photo = `https://uri-avatars.com/api/?name=${name}&length=1`;
                
                const userLogged = {
                    id: String(credential.user),
                    email: credential.email!,
                    name,
                    photo,
                };

                setUser(userLogged);
                await AsyncStorage.setItem(userStorageKey , JSON.stringify(userLogged));
            }
            

        } catch (error) {
            throw new Error(error);
        }
    }

    async function SignOut(){
        setUser({} as User)
        await AsyncStorage.removeItem(userStorageKey);
    }

    useEffect(() => {
        async function loadUserStorageDate() {
            const userStorage = await AsyncStorage.getItem(userStorageKey)

            if(userStorage){
                const userLogged = JSON.parse(userStorage) as User;
                setUser(userLogged);
            }

            setUserStorageLoading(false);
        }
        
        loadUserStorageDate();
    }, []);
    return (
        <AuthContext.Provider value={{
            user,
            SignInWithGoogle,
            SignInWithApple,
            SignOut,
            userStorageLoading,
        }}>
            { children }
        </AuthContext.Provider>
    )
}



function useAuth(){
    const context = useContext(AuthContext);

    return context;
}

export { AuthProvider, useAuth }