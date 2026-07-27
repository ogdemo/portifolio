import { useEffect, useState } from "react";
import Toast from "./Toast";

export default function AdminOrders() {

  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);


  // Load orders
  const loadOrders = async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/orders"
      );

      const data = await res.json();


      if (Array.isArray(data)) {

        setOrders(data);

      } else {

        console.log(data);
        setOrders([]);

      }


    } catch (error) {

      console.log(error);
      setOrders([]);

    }

  };



  useEffect(() => {

    loadOrders();

  }, []);





  // Delete order
  const deleteOrder = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );


    if (!confirmDelete) return;



    try {

      const res = await fetch(
        `http://localhost:5000/orders/${id}`,
        {
          method:"DELETE"
        }
      );


      const data = await res.json();



      if(res.ok){
        setToast({ message: data.message, type: "info" });

        setOrders((previousOrders)=>
          previousOrders.filter(
            (order)=>
              order.order_id !== id
          )
        );

      }else{

        setToast({ message: data.message, type: "error" });

      }



    } catch(error){

      console.log(error);

      setToast({ message: "Delete failed", type: "error" });

    }

  };





  return (

    <div className="
    min-h-screen
    bg-gray-100
    p-6
    md:p-10
    mt-16
    ">

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />


      <div className="mb-8">

        <h1 className="
        text-4xl
        font-bold
        text-gray-800
        ">
          Manage Orders
        </h1>


        <p className="
        text-gray-500
        mt-2
        ">
          Manage customer orders and payment status
        </p>


      </div>





      {/* Summary Cards */}

      <div className="
      grid
      md:grid-cols-3
      gap-6
      mb-8
      ">


        <div className="
        bg-white
        shadow
        rounded-xl
        p-6
        ">

          <p className="text-gray-500">
            Total Orders
          </p>

          <h2 className="
          text-3xl
          font-bold
          text-blue-600
          ">
            {orders.length}
          </h2>

        </div>





        <div className="
        bg-white
        shadow
        rounded-xl
        p-6
        ">

          <p className="text-gray-500">
            Pending Payment
          </p>


          <h2 className="
          text-3xl
          font-bold
          text-yellow-600
          ">

          {
            orders.filter(
              (order) =>
                order.payment_status?.toUpperCase() === "PENDING"
            ).length
          }

          </h2>


        </div>





        <div className="
        bg-white
        shadow
        rounded-xl
        p-6
        ">


          <p className="text-gray-500">
            Paid Orders
          </p>


          <h2 className="
          text-3xl
          font-bold
          text-green-600
          ">

          {
            orders.filter(
              (order) =>
                order.payment_status?.toUpperCase() === "PAID"
            ).length
          }

          </h2>


        </div>


      </div>







      {/* Orders Table */}

      <div className="
      bg-white
      rounded-xl
      shadow-lg
      overflow-hidden
      ">


        <div className="
        p-5
        border-b
        ">

          <h2 className="
          text-xl
          font-bold
          ">
            Orders List
          </h2>

        </div>





        <div className="overflow-x-auto">


        <table className="w-full">


          <thead className="
          bg-gray-800
          text-white
          ">


            <tr>


              <th className="p-4">
                ID
              </th>


              <th className="p-4">
                Customer
              </th>


              <th className="p-4">
                Email
              </th>


              <th className="p-4">
                Phone
              </th>


              <th className="p-4">
                Location
              </th>


              <th className="p-4">
                Product
              </th>


              <th className="p-4">
                Quantity
              </th>


              <th className="p-4">
                Date
              </th>


              <th className="p-4">
                Payment Status
              </th>


              <th className="p-4">
                Action
              </th>


            </tr>


          </thead>





          <tbody>


          {
            orders.map((o)=>(


              <tr
                key={`${o.order_id}-${o.product_id}`}
                className="
                border-b
                hover:bg-gray-50
                "
              >


                <td className="
                p-4
                text-center
                font-bold
                ">
                  #{o.order_id}
                </td>





                <td className="
                p-4
                text-center
                ">
                  {o.fullname}
                </td>





                <td className="
                p-4
                text-center
                ">
                  {o.email}
                </td>





                <td className="
                p-4
                text-center
                ">
                  {o.phone}
                </td>





                <td className="
                p-4
                text-center
                ">
                  {o.location}
                </td>





                <td className="
                p-4
                text-center
                font-semibold
                ">
                  {o.product_name}
                </td>





                <td className="
                p-4
                text-center
                ">
                  {o.quantity}
                </td>





                <td className="
                p-4
                text-center
                ">

                  {
                    new Date(
                      o.order_date
                    ).toLocaleDateString()
                  }

                </td>





                <td className="
                p-4
                text-center
                ">


                  <span
                    className={`
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    font-semibold
                    ${
                      o.payment_status?.toUpperCase() === "PAID"
                        ? "bg-green-100 text-green-700"
                        : o.payment_status?.toUpperCase() === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  `}
                  >
                    {o.payment_status}
                  </span>


                </td>





                <td className="
                p-4
                text-center
                ">


                  <button

                    onClick={() =>
                      deleteOrder(o.order_id)
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

                    Delete

                  </button>


                </td>


              </tr>


            ))
          }


          </tbody>


        </table>





        {
          orders.length === 0 && (

            <p className="
            text-center
            p-10
            text-gray-500
            font-bold
            ">

              No Orders Found

            </p>

          )
        }



        </div>


      </div>


    </div>

  );

}