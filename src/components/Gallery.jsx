import dark from "../assets/dark.png";
import inside from "../assets/inside.png";
import liquor from "../assets/liquor.png";
import people from "../assets/people.png";

const galleryImages = [
  {
    image: dark,
    title: "Elegant Dining",
    description: "Enjoy a luxurious dining experience in our warm and welcoming restaurant.",
  },
  {
    image: inside,
    title: "Modern Interior",
    description: "A stylish interior designed for comfort, relaxation, and memorable moments.",
  },
  {
    image: liquor,
    title: "Premium Wine & Spirits",
    description: "Discover our collection of premium wines, whiskey, cognac, vodka, and more.",
  },
  {
    image: people,
    title: "Happy Customers",
    description: "Creating unforgettable memories with friends, family, and loved ones.",
  },
];

export default function Gallery() {
  return (
    <div className="bg-white">

      {/* Hero Section */}
      <section className="relative bg-gray-900 py-24">
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="uppercase tracking-[6px] text-green-400 font-semibold">
            Green Coffee
          </p>

          <h1 className="mt-4 text-4xl md:text-6xl font-bold text-white">
            Our Gallery
          </h1>

          <p className="mt-6 text-gray-300 max-w-3xl mx-auto text-lg leading-8">
            Take a glimpse inside Green Coffee Restaurant & Bar. From our elegant
            dining space and modern interiors to our premium wine & spirits
            collection, every corner is designed to create unforgettable
            experiences.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {galleryImages.map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl shadow-xl"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-[450px] object-cover duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90"></div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-8 text-white">

                  <h2 className="text-3xl font-bold mb-3">
                    {item.title}
                  </h2>

                  <p className="text-gray-200 leading-7 mb-6">
                    {item.description}
                  </p>

                  <button className="bg-green-600 hover:bg-green-700 duration-300 px-6 py-3 rounded-full font-semibold">
                    View Image
                  </button>

                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900">
              Why Visit Green Coffee?
            </h2>

            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              We combine delicious food, premium drinks, exceptional service,
              and a comfortable atmosphere to create the perfect place for every
              occasion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl duration-300">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold mb-3">
                Delicious Meals
              </h3>
              <p className="text-gray-600 leading-7">
                Enjoy freshly prepared dishes made with quality ingredients by
                experienced chefs.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl duration-300">
              <div className="text-5xl mb-4">🥂</div>
              <h3 className="text-2xl font-bold mb-3">
                Premium Drinks
              </h3>
              <p className="text-gray-600 leading-7">
                Explore our collection of wines, whiskey, cognac, cocktails,
                beer, coffee, and refreshing beverages.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl duration-300">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold mb-3">
                Excellent Service
              </h3>
              <p className="text-gray-600 leading-7">
                Friendly staff and outstanding customer service ensure every
                visit becomes a memorable experience.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}