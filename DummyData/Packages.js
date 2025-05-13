// example: seed.js or inside server.js
const YourModel = require(".././models/Package"); // adjust the path

const insertDefaultData = async () => {
  try {
    const count = await YourModel.countDocuments();
    if (count === 0) {
      await YourModel.insertMany([
        {
          title: "Swat Valley Adventure",
          desc: "Explore the stunning green meadows, rivers, and cultural heritage of Swat.",
          img: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          startPoint: "Islamabad",
          destinations: ["Kalam", "Malam Jabba", "Swat Valley"],
          duration: "5 days",
          price: 45000,
          rating: 4.8,
          images: [
            "https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1586002990553-8850c4049470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          ],
        },
        {
          title: "Kashmir Paradise Tour",
          desc: "Experience paradise on earth with mesmerizing valleys and serene lakes.",
          img: "https://images.unsplash.com/photo-1566837497312-7be4a9daf7a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          startPoint: "Lahore",
          destinations: ["Muzaffarabad", "Neelum Valley", "Pir Chinasi"],
          duration: "7 days",
          price: 65000,
          rating: 4.9,
          images: [
            "https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1586002990553-8850c4049470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          ],
        },
        {
          title: "Naran Kaghan Expedition",
          desc: "Visit the enchanting Saif-ul-Malook Lake and the lush Kaghan Valley.",
          img: "https://images.unsplash.com/photo-1586002990553-8850c4049470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          startPoint: "Islamabad",
          destinations: ["Shogran", "Naran", "Lake Saif-ul-Malook"],
          duration: "6 days",
          price: 55000,
          rating: 4.7,
          images: [
            "https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1586002990553-8850c4049470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          ],
          coordinates: [
            { place: "Islamabad", lat: 33.6844, lng: 73.0479 },
            { place: "Kalam", lat: 35.4867, lng: 72.5798 },
            { place: "Malam Jabba", lat: 34.8156, lng: 72.5631 },
            { place: "Swat Valley", lat: 35.2227, lng: 72.4258 },
          ],

          itinerary: [
            {
              day: 1,
              title: "Departure from Islamabad",
              description:
                "Early morning departure from Islamabad, travel through scenic routes to reach Kalam by evening.",
            },
            {
              day: 2,
              title: "Explore Kalam",
              description:
                "Visit local attractions including Kalam River, Ushu Forest, and enjoy local cuisine.",
            },
            {
              day: 3,
              title: "Malam Jabba",
              description:
                "Travel to Malam Jabba Ski Resort, enjoy the scenic beauty and adventure activities.",
            },
            {
              day: 4,
              title: "Swat Valley Tour",
              description:
                "Explore the main Swat Valley, visit historical sites and natural attractions.",
            },
            {
              day: 5,
              title: "Return to Islamabad",
              description:
                "Morning departure from Swat, arrive in Islamabad by evening.",
            },
          ],
        },
        {
          title: "Islamabad City Tour",
          desc: "Discover the modern capital city with its parks, museums, and Margalla Hills.",
          img: "https://images.unsplash.com/photo-1529245856630-f4853233d2ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          startPoint: "Rawalpindi",
          destinations: [
            "Faisal Mosque",
            "Pakistan Monument",
            "Margalla Hills",
          ],
          duration: "3 days",
          price: 25000,
          rating: 4.5,
          images: [
            "https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1586002990553-8850c4049470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          ],
          coordinates: [
            { place: "Islamabad", lat: 33.6844, lng: 73.0479 },
            { place: "Kalam", lat: 35.4867, lng: 72.5798 },
            { place: "Malam Jabba", lat: 34.8156, lng: 72.5631 },
            { place: "Swat Valley", lat: 35.2227, lng: 72.4258 },
          ],

          itinerary: [
            {
              day: 1,
              title: "Departure from Islamabad",
              description:
                "Early morning departure from Islamabad, travel through scenic routes to reach Kalam by evening.",
            },
            {
              day: 2,
              title: "Explore Kalam",
              description:
                "Visit local attractions including Kalam River, Ushu Forest, and enjoy local cuisine.",
            },
            {
              day: 3,
              title: "Malam Jabba",
              description:
                "Travel to Malam Jabba Ski Resort, enjoy the scenic beauty and adventure activities.",
            },
            {
              day: 4,
              title: "Swat Valley Tour",
              description:
                "Explore the main Swat Valley, visit historical sites and natural attractions.",
            },
            {
              day: 5,
              title: "Return to Islamabad",
              description:
                "Morning departure from Swat, arrive in Islamabad by evening.",
            },
          ],
        },
        {
          title: "Lahore Cultural Heritage",
          desc: "Immerse yourself in the vibrant culture, history, and cuisine of Lahore.",
          img: "https://images.unsplash.com/photo-1567604130959-7ea7ab2a7807?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          startPoint: "Islamabad",
          destinations: ["Badshahi Mosque", "Lahore Fort", "Shalimar Gardens"],
          duration: "4 days",
          price: 35000,
          rating: 4.6,
          images: [
            "https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1586002990553-8850c4049470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          ],
          coordinates: [
            { place: "Islamabad", lat: 33.6844, lng: 73.0479 },
            { place: "Kalam", lat: 35.4867, lng: 72.5798 },
            { place: "Malam Jabba", lat: 34.8156, lng: 72.5631 },
            { place: "Swat Valley", lat: 35.2227, lng: 72.4258 },
          ],

          itinerary: [
            {
              day: 1,
              title: "Departure from Islamabad",
              description:
                "Early morning departure from Islamabad, travel through scenic routes to reach Kalam by evening.",
            },
            {
              day: 2,
              title: "Explore Kalam",
              description:
                "Visit local attractions including Kalam River, Ushu Forest, and enjoy local cuisine.",
            },
            {
              day: 3,
              title: "Malam Jabba",
              description:
                "Travel to Malam Jabba Ski Resort, enjoy the scenic beauty and adventure activities.",
            },
            {
              day: 4,
              title: "Swat Valley Tour",
              description:
                "Explore the main Swat Valley, visit historical sites and natural attractions.",
            },
            {
              day: 5,
              title: "Return to Islamabad",
              description:
                "Morning departure from Swat, arrive in Islamabad by evening.",
            },
          ],
        },
        {
          title: "Karachi Coastal Retreat",
          desc: "Experience the bustling life of Karachi with its beaches and diverse culture.",
          img: "https://images.unsplash.com/photo-1567604737697-aa489e0b157a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          startPoint: "Hyderabad",
          destinations: ["Clifton Beach", "Mazar-e-Quaid", "Port Grand"],
          duration: "5 days",
          price: 40000,
          rating: 4.4,
          images: [
            "https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1586002990553-8850c4049470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
          ],
          coordinates: [
            { place: "Islamabad", lat: 33.6844, lng: 73.0479 },
            { place: "Kalam", lat: 35.4867, lng: 72.5798 },
            { place: "Malam Jabba", lat: 34.8156, lng: 72.5631 },
            { place: "Swat Valley", lat: 35.2227, lng: 72.4258 },
          ],

          itinerary: [
            {
              day: 1,
              title: "Departure from Islamabad",
              description:
                "Early morning departure from Islamabad, travel through scenic routes to reach Kalam by evening.",
            },
            {
              day: 2,
              title: "Explore Kalam",
              description:
                "Visit local attractions including Kalam River, Ushu Forest, and enjoy local cuisine.",
            },
            {
              day: 3,
              title: "Malam Jabba",
              description:
                "Travel to Malam Jabba Ski Resort, enjoy the scenic beauty and adventure activities.",
            },
            {
              day: 4,
              title: "Swat Valley Tour",
              description:
                "Explore the main Swat Valley, visit historical sites and natural attractions.",
            },
            {
              day: 5,
              title: "Return to Islamabad",
              description:
                "Morning departure from Swat, arrive in Islamabad by evening.",
            },
          ],
        },
      ]);
      console.log("Default data inserted");
    }
  } catch (err) {
    console.error("Error inserting default data:", err);
  }
};

insertDefaultData(); // call this after DB connection
