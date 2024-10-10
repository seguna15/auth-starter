import {useEffect} from 'react'
import { Spinner } from '../../components'
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const OauthSuccess = () => {
    const {isLoading, googleAuthSuccessful} = useAuthStore()
    const { email } = useParams();
    const navigate = useNavigate()
    
    useEffect(() => {
      googleAuthSuccessful(email);
      navigate("/")
    }, [googleAuthSuccessful, email]);

  return (
    <>
         {isLoading ? <Spinner/> : <h1 className='text-4xl text-white'>Redirecting</h1>}
    </>
 
  )
}

export default OauthSuccess