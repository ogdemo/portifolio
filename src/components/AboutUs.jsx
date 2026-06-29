import arabiccoffess from "../assets/arabiccoffess.png";
import { Link } from 'react-router-dom'
export default function AboutUs() {
  return (
    <div className="bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-16 md:py-20 px-4 sm:px-6 text-center">

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          About Green Coffee
        </h1>

        <p className="mt-5 max-w-3xl mx-auto text-gray-300 text-base sm:text-lg leading-7">
          We are passionate about delivering high-quality coffee products
          that bring people together through great taste and unforgettable
          experiences.
        </p>

      </section>




      {/* Our Story */}
      <section className="
        max-w-7xl 
        mx-auto 
        px-4 
        sm:px-6 
        lg:px-8 
        py-12 
        md:py-16
        grid 
        grid-cols-1 
        md:grid-cols-2 
        gap-10 
        items-center
      ">


        {/* Text */}
        <div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Story
          </h2>


          <p className="mt-5 text-gray-600 leading-7">
            Green Coffee was created with a simple goal: to provide coffee
            lovers with fresh, quality, and affordable coffee products.
            We work with dedication to ensure every customer receives
            excellent service and the best coffee experience.
          </p>


          <p className="mt-4 text-gray-600 leading-7">
            From selecting quality coffee products to delivering them to
            customers, we focus on quality, trust, and satisfaction.
          </p>


          <button className="
            mt-6
            bg-gray-900
            text-white
            px-6
            py-3
            rounded-lg
            hover:bg-gray-700
            transition
          ">
            Explore Products
          </button>


        </div>




        {/* Image */}
        <div className="relative">


          <img
            src={arabiccoffess}
            alt="Arabica Coffee"
            className="
              w-full
              h-72
              sm:h-96
              md:h-[450px]
              object-cover
              rounded-2xl
              shadow-xl
              hover:scale-105
              transition-transform
              duration-500
            "
          />



          {/* Image Badge */}
          <div className="
            absolute
            bottom-5
            left-5
            bg-white
            px-5
            py-4
            rounded-xl
            shadow-lg
          ">

            <h3 className="font-bold text-gray-900">
              Premium Coffee
            </h3>

            <p className="text-sm text-gray-600">
              Fresh taste in every cup
            </p>

          </div>


        </div>


      </section>






      {/* Mission & Vision */}
      <section className="bg-white py-12 md:py-16 px-4 sm:px-6">


        <div className="
          max-w-7xl
          mx-auto
          grid
          grid-cols-1
          md:grid-cols-2
          gap-8
        ">



          <div className="
            p-6
            md:p-8
            rounded-xl
            shadow-md
            bg-gray-50
          ">

            <h3 className="text-2xl font-bold text-gray-900">
              Our Mission
            </h3>


            <p className="mt-4 text-gray-600 leading-7">
              To provide customers with excellent coffee products,
              reliable service, and a shopping experience they can trust.
            </p>


          </div>





          <div className="
            p-6
            md:p-8
            rounded-xl
            shadow-md
            bg-gray-50
          ">


            <h3 className="text-2xl font-bold text-gray-900">
              Our Vision
            </h3>


            <p className="mt-4 text-gray-600 leading-7">
              To become a trusted coffee brand known for quality,
              innovation, and customer satisfaction.
            </p>


          </div>


        </div>


      </section>







      {/* Why Choose Us */}
      <section className="
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        lg:px-8
        py-12
        md:py-16
      ">


        <h2 className="
          text-3xl
          md:text-4xl
          font-bold
          text-center
          text-gray-900
        ">
          Why Choose Us?
        </h2>




        <div className="
          mt-10
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          gap-8
        ">



          <div className="
            bg-white
            p-6
            rounded-xl
            shadow-md
            text-center
          ">

            <h3 className="text-xl font-bold">
              Quality Products
            </h3>


            <p className="mt-3 text-gray-600">
              Carefully selected coffee products with excellent taste.
            </p>

          </div>





          <div className="
            bg-white
            p-6
            rounded-xl
            shadow-md
            text-center
          ">

            <h3 className="text-xl font-bold">
              Fast Service
            </h3>


            <p className="mt-3 text-gray-600">
              Quick response and reliable customer support.
            </p>

          </div>





          <div className="
            bg-white
            p-6
            rounded-xl
            shadow-md
            text-center
          ">

            <h3 className="text-xl font-bold">
              Customer Satisfaction
            </h3>


            <p className="mt-3 text-gray-600">
              We always focus on giving customers the best experience.
            </p>

          </div>



        </div>


      </section>







      {/* Statistics */}
      <section className="
        bg-gray-900
        text-white
        py-12
        px-4
      ">


        <div className="
          max-w-5xl
          mx-auto
          grid
          grid-cols-2
          md:grid-cols-4
          gap-8
          text-center
        ">


          <div>
            <h2 className="text-3xl font-bold">
              500+
            </h2>
            <p className="text-gray-400">
              Customers
            </p>
          </div>


          <div>
            <h2 className="text-3xl font-bold">
              50+
            </h2>
            <p className="text-gray-400">
              Products
            </p>
          </div>


          <div>
            <h2 className="text-3xl font-bold">
              5+
            </h2>
            <p className="text-gray-400">
              Years Experience
            </p>
          </div>


          <div>
            <h2 className="text-3xl font-bold">
              24/7
            </h2>
            <p className="text-gray-400">
              Support
            </p>
          </div>


        </div>


      </section>







      {/* CTA */}
      <section className="
        py-14
        px-4
        text-center
      ">


        <h2 className="text-3xl font-bold text-gray-900">
          Ready to Enjoy Our Coffee?
        </h2>


        <p className="mt-4 text-gray-600">
          Explore our products and order your favorite coffee today.
        </p>


        <Link to="/products" className="
          mt-6
          bg-gray-900
          text-white
          px-8
          py-3
          rounded-lg
          hover:bg-gray-700
          transition
        ">
          View Products
        </Link >


      </section>


    </div>
  );
}