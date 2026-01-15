import { useEffect, useState } from "react";

const USERS = [

  {
    name: "Julia Soares",
    role: "Architect",
    image: "/Street Life - Head (1).svg",
    username: "arquiteta-julia-soares",
    description: "Architect & Designer creating sustainable living spaces."
  },
  {
    name: "Bruno Bianchi",
    role: "Developer",
    image: "/users-photos/bruno-bianchi.png",
    username: "bruno-bianchi",
    description: "Full Stack Developer - Creator of @Portyo.me"
  },
  {
    name: "Dra Mariana",
    role: "Dentist",
    image: "/users-photos/dra-mariana-bianchi.jpg",
    username: "dra-mariana-bianchi",
    description: "Orofacial Harmonization and Resin Veneers Specialist."
  },
  {
    name: "EstagioAi",
    role: "Saas",
    image: "/users-photos/estagioai.png",
    username: "estagioai",
    description: "Connecting students with internship opportunities in Brazil."
  },
  {
    name: "EstagioAi",
    role: "Saas",
    image: "/users-photos/estagioai.png",
    username: "estagioai",
    description: "Connecting students with internship opportunities in Brazil."
  },
];

export default function CarouselSection() {
  const items = [...USERS, ...USERS];

  return (
    <section className="w-full overflow-hidden py-10 bg-surface-alt top-[-102px] relative">
      <div className="flex w-max animate-scroll hover:[animation-play-state:paused]">
        {items.map((user, index) => (
          <div
            key={`${user.username}-${index}`}
            className="relative w-[240px] h-[320px] mx-3 rounded-2xl group cursor-pointer shrink-0 [perspective:1000px]"
          >
            <div className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              {/* Front Face */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-3 flex items-center justify-between shadow-lg">
                  <span className="font-bold text-text-main text-sm truncate mr-2">{user.name}</span>
                  <span className="text-text-muted text-xs whitespace-nowrap">{user.role}</span>
                </div>
              </div>

              {/* Back Face */}
              <div className="absolute inset-0 w-full h-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden bg-black">
                {/* Blurred Background Image */}
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm opacity-50"
                  style={{ backgroundImage: `url(${user.image})` }}
                ></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                  <a
                    href={`/p/${user.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white font-bold text-sm mb-2 hover:underline"
                  >
                    portyo.me/p/{user.username}
                  </a>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {user.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
