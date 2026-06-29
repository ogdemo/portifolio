import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ closeForm }) {

  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");



  const showMessage = (text, type) => {

    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);

  };



  const handleSubmit = async (e) => {

    e.preventDefault();


    const url =
      mode === "login"
        ? "http://localhost:5000/login"
        : "http://localhost:5000/register";



    const body =
      mode === "login"
        ? {
            email,
            password
          }
        :
          {
            fullname,
            email,
            password,
            phone,
            location
          };



    try {


      const response = await fetch(url, {

        method: "POST",

        headers:{
          "Content-Type":"application/json"
        },

        body: JSON.stringify(body)

      });



      const data = await response.json();



      if(!response.ok){

        showMessage(
          data.message || "Something went wrong",
          "error"
        );

        return;

      }



      showMessage(
        data.message,
        "success"
      );



      // CLEAR FORM

      setFullname("");
      setEmail("");
      setPassword("");
      setPhone("");
      setLocation("");





      // LOGIN SUCCESS

      if(mode === "login"){


        // Save user information

        localStorage.setItem(
          "token",
          data.token
        );


        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );



        setTimeout(()=>{


          // ADMIN ACCESS

          if(data.user.role === "admin"){

            navigate("/dashboard");

          }



          // CUSTOMER ACCESS

          else{

            navigate("/products");

          }



          closeForm();


        },1500);



      }




      // REGISTER SUCCESS

      else{


        setTimeout(()=>{

          setMode("login");

        },1500);


      }



    } catch(error){

      console.log(error);

      showMessage(
        "Server error. Try again later",
        "error"
      );

    }

  };




  return (

    <div className="auth-modal">


      <div className="form-box">


        <button

          onClick={closeForm}

          className="absolute top-3 right-4 text-2xl"

        >
          ×

        </button>



        <h1>

          {
            mode === "login"
            ? "Login"
            : "Create Account"
          }

        </h1>




        {
          message &&

          <div className={`message ${messageType}`}>

            {message}

          </div>

        }




        <form onSubmit={handleSubmit}>


          {
            mode === "register" &&

            <>


              <input

                type="text"

                placeholder="Full Name"

                value={fullname}

                onChange={(e)=>setFullname(e.target.value)}

                required

              />



              <input

                type="text"

                placeholder="Phone Number"

                value={phone}

                onChange={(e)=>setPhone(e.target.value)}

                required

              />



              <input

                type="text"

                placeholder="Location"

                value={location}

                onChange={(e)=>setLocation(e.target.value)}

                required

              />


            </>

          }





          <input

            type="email"

            placeholder="Email"

            value={email}

            onChange={(e)=>setEmail(e.target.value)}

            required

          />




          <input

            type="password"

            placeholder="Password"

            value={password}

            onChange={(e)=>setPassword(e.target.value)}

            required

          />





          <p>


            {
              mode === "login"

              ?

              <>

              Don't have account?

              <button

                type="button"

                onClick={()=>setMode("register")}

              >

                Register

              </button>

              </>


              :

              <>

              Already have account?

              <button

                type="button"

                onClick={()=>setMode("login")}

              >

                Login

              </button>


              </>

            }


          </p>





          <button

            type="submit"

            className="btn"

          >

            {
              mode === "login"
              ?
              "Login"
              :
              "Register"
            }


          </button>



        </form>



      </div>



    </div>

  );

}