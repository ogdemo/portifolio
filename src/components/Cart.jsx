import { useState } from "react";

export default function Cart({
  cartItems,
  removeFromCart,
  increaseQty,
  decreaseQty,
}) {

  const [paymentMethod, setPaymentMethod] = useState("");

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );


  const checkout = async () => {

    const user = JSON.parse(localStorage.getItem("user"));


    if (!user) {
      alert("Login required");
      return;
    }


    if (!paymentMethod) {
      alert("Please select payment method");
      return;
    }


    try {

      const res = await fetch(
        "http://localhost:5000/checkout",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },


          body: JSON.stringify({

            user_id: user.id,


            payment_method: paymentMethod,


            cartItems: cartItems.map((item) => ({

              product_id: item.product_id,

              qty: item.qty

            }))

          }),

        }
      );


      const data = await res.json();


      alert(data.message);


      if(res.ok){

        setPaymentMethod("");

        window.location.reload();

      }


    } catch(error){

      console.log(error);

      alert("Checkout failed");

    }

  };



  return (

    <div className="min-h-screen bg-gray-100 pt-24 px-4">


      <div className="max-w-5xl mx-auto">


        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Shopping Cart
        </h1>



        {
          cartItems.length === 0 ?


          (

            <div className="bg-white p-10 rounded-xl shadow text-center">

              <h2 className="text-xl text-gray-500">
                Your cart is empty
              </h2>

            </div>

          )


          :


          (

          <>


          {
            cartItems.map((item)=>(


              <div
                key={item.product_id}
                className="
                bg-white 
                rounded-xl 
                shadow-md 
                mb-4 
                p-4 
                flex 
                flex-col 
                md:flex-row 
                items-center 
                gap-5
                "
              >



                {/* Image */}

                <img

                  src={item.image}

                  alt={item.name}

                  className="
                  w-28 
                  h-28 
                  object-cover 
                  rounded-lg
                  "

                />





                {/* Product Info */}

                <div className="flex-1">


                  <h2 className="text-xl font-bold text-gray-800">

                    {item.name}

                  </h2>



                  <p className="text-green-600 font-bold mt-2">

                    FRW {Number(item.price).toLocaleString()}

                  </p>



                  <p className="text-gray-500">

                    Subtotal:
                    FRW {(item.price * item.qty)
                    .toLocaleString()}

                  </p>


                </div>






                {/* Quantity */}


                <div className="flex items-center gap-3">


                  <button

                    onClick={() =>
                      decreaseQty(item.product_id)
                    }

                    className="
                    bg-gray-200
                    px-3
                    py-1
                    rounded
                    "

                  >

                    -

                  </button>




                  <span className="font-bold">

                    {item.qty}

                  </span>





                  <button

                    onClick={() =>
                      increaseQty(item.product_id)
                    }

                    className="
                    bg-gray-200
                    px-3
                    py-1
                    rounded
                    "

                  >

                    +

                  </button>


                </div>






                {/* Remove */}


                <button

                  onClick={() =>
                    removeFromCart(item.product_id)
                  }

                  className="
                  bg-red-500
                  hover:bg-red-600
                  text-white
                  px-4
                  py-2
                  rounded-lg
                  "

                >

                  Remove

                </button>




              </div>


            ))

          }







          {/* Checkout Area */}


          <div className="
          bg-white
          rounded-xl
          shadow-md
          p-6
          mt-6
          ">



            <h2 className="text-xl font-bold mb-4">

              Payment Method

            </h2>





            <select

              value={paymentMethod}

              onChange={(e)=>
                setPaymentMethod(e.target.value)
              }

              className="
              w-full
              border
              p-3
              rounded-lg
              mb-5
              "

            >


              <option value="">

                Select Payment

              </option>


              <option value="Cash on Delivery">

                Cash on Delivery

              </option>


              <option value="MTN Mobile Money">

                MTN Mobile Money

              </option>


              <option value="Airtel Money">

                Airtel Money

              </option>


            </select>







            <div className="
            flex 
            justify-between
            items-center
            mb-5
            ">


              <h2 className="text-2xl font-bold">

                Total

              </h2>



              <span className="
              text-2xl
              font-bold
              text-green-600
              ">

                FRW {total.toLocaleString()}

              </span>



            </div>





            <button

              onClick={checkout}

              className="
              w-full
              bg-green-600
              hover:bg-green-700
              text-white
              py-3
              rounded-lg
              font-semibold
              "

            >

              Confirm Order

            </button>



          </div>



          </>

          )

        }



      </div>


    </div>

  );

}