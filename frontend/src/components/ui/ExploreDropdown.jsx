import React from "react";

const exploreData = [
  {
    title: "Explore roles",
    items: [
      "Data Analyst", "Project Manager", "Cyber Security Analyst", "Data Scientist",
      "Business Intelligence Analyst", "Digital Marketing Specialist", "UI / UX Designer",
      "Machine Learning Engineer", "Social Media Specialist", "Computer Support Specialist",
      { label: "View all", link: "#" }
    ]
  },
  {
    title: "Explore categories",
    items: [
      "Artificial Intelligence", "Business", "Data Science", "Information Technology",
      "Computer Science", "Healthcare", "Physical Science and Engineering",
      "Personal Development", "Social Sciences", "Language Learning", "Arts and Humanities",
      { label: "View all", link: "#" }
    ]
  },
  {
    title: "Earn a Professional Certificate",
    items: [
      "Business", "Computer Science", "Data Science", "Information Technology",
      { label: "View all", link: "#" }
    ]
  },
  {
    title: "Explore trending skills",
    items: [
      "Python", "Artificial Intelligence", "Excel", "Machine Learning", "SQL",
      "Project Management", "Power BI", "Marketing"
    ]
  },
  {
    title: "Earn an online degree",
    items: [
      "Bachelor's Degrees", "Master's Degrees", "Postgraduate Programs",
      { label: "View all", link: "#" }
    ]
  },
  {
    title: "Prepare for a certification exam",
    items: [
      { label: "View all", link: "#" }
    ]
  }
];

export default function ExploreDropdown({ open }) {
  if (!open) return null;
  return (
    <div
      className="absolute left-0 top-full w-[900px] bg-white shadow-2xl z-[100] border-b border-gray-200"
      style={{ minHeight: '320px', overflow: 'visible' }}
    >
      <div className="px-8 py-8 grid grid-cols-4 gap-12">
        {exploreData.map((section, idx) => (
          <div key={idx}>
            <h4 className="font-semibold mb-3 text-gray-900 text-base">{section.title}</h4>
            <ul className="space-y-1">
              {section.items.map((item, i) =>
                typeof item === "string" ? (
                  <li key={i} className="hover:underline cursor-pointer text-gray-700 text-sm">{item}</li>
                ) : (
                  <li key={i}>
                    <a href={item.link} className="text-blue-600 hover:underline text-sm">{item.label}</a>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
