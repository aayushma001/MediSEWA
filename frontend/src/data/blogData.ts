export interface BlogPost {
    id: string;
    title: string;
    category: string;
    author: {
        name: string;
        avatar?: string;
    };
    date: string;
    readTime: string;
    excerpt: string;
    content: string;
    image: string;
    tags: string[];
}

export const blogPosts: BlogPost[] = [
    {
        id: 'healthy-lifestyle-tips',
        title: '10 Tips for Maintaining a Healthy Lifestyle Year-Round',
        category: 'Health Tips',
        author: {
            name: 'Dr. Darren Elder',
            avatar: '/doctor-avatar.jpg'
        },
        date: '4 Dec 2024',
        readTime: '10 mins read',
        excerpt: 'Discover practical, everyday tips to help you stay healthy throughout the year.',
        content: `
      <p>Maintaining a healthy lifestyle year-round is achievable with consistent habits that support your physical and mental well-being. One of the key pillars is staying hydrated, as water is essential for digestion, nutrient absorption, and overall bodily functions. Aim to drink at least eight glasses of water daily, adjusting for exercise and weather conditions. A balanced diet is equally important, as it fuels your body with the nutrients it needs for energy, growth, and repair. Incorporate a variety of fruits, vegetables, lean proteins, and whole grains to ensure you're getting a diverse range of vitamins and minerals.</p>

      <p>Regular physical activity is another cornerstone of a healthy lifestyle. Engaging in at least 150 minutes of moderate exercise per week, such as walking or cycling, can boost your cardiovascular health, strengthen muscles, and improve mood. Equally important is prioritizing sleep. Getting 7-9 hours of quality sleep each night helps regulate your mood, enhances mental clarity, and supports physical health. With these tips in mind, you'll be on your way to maintaining a healthy lifestyle all year long.</p>

      <blockquote>An extra important note to remember is that consistency is key. Small, sustainable changes in your daily habits will have a more lasting impact than short-term, extreme efforts. Prioritize gradual improvements in your routine and be patient with yourself – lasting health is a marathon, not a sprint.</blockquote>

      <h3>Key Takeaways</h3>
      <ul>
        <li>Stay hydrated by drinking at least 8 glasses of water daily</li>
        <li>Maintain a balanced diet with fruits, vegetables, lean proteins, and whole grains</li>
        <li>Exercise regularly - aim for 150 minutes of moderate activity per week</li>
        <li>Prioritize 7-9 hours of quality sleep each night</li>
        <li>Practice stress management through meditation or relaxation techniques</li>
        <li>Schedule regular health check-ups and preventive screenings</li>
      </ul>
    `,
        image: '/Blog.jpg',
        tags: ['Health Tips', 'Wellness', 'Prevention']
    },
    {
        id: 'common-symptoms-doctor',
        title: 'Understanding Common Symptoms: When to See a Doctor',
        category: 'Awareness',
        author: {
            name: 'Robin Frost',
            avatar: '/doctor-avatar.jpg'
        },
        date: '14 Apr 2024',
        readTime: '8 mins read',
        excerpt: 'Learn how to identify common symptoms and when it\'s important to seek medical attention.',
        content: `
      <p>Understanding when to seek medical attention is crucial for maintaining your health and preventing serious complications. While many symptoms are harmless and resolve on their own, some require immediate medical evaluation. Persistent fever above 103°F (39.4°C), severe chest pain, difficulty breathing, sudden severe headaches, or unexplained weight loss are all red flags that warrant a doctor's visit.</p>

      <p>It's also important to pay attention to changes in your body. If you notice unusual lumps, changes in moles, persistent digestive issues, or symptoms that interfere with your daily activities, don't hesitate to consult a healthcare professional. Early detection and treatment can make a significant difference in outcomes for many conditions.</p>

      <h3>Warning Signs That Require Immediate Attention</h3>
      <ul>
        <li>Chest pain or pressure, especially with shortness of breath</li>
        <li>Sudden severe headache or vision changes</li>
        <li>Difficulty breathing or persistent cough with blood</li>
        <li>Severe abdominal pain or persistent vomiting</li>
        <li>Signs of stroke: facial drooping, arm weakness, speech difficulty</li>
        <li>High fever (above 103°F) that doesn't respond to medication</li>
      </ul>

      <p>Remember, it's always better to err on the side of caution. If you're unsure whether your symptoms warrant medical attention, contact your healthcare provider for guidance. They can help you determine whether you need an immediate appointment, can wait for a routine visit, or can manage the symptoms at home.</p>
    `,
        image: '/Blog1.jpg',
        tags: ['Awareness', 'Health', 'Symptoms']
    },
    {
        id: 'nutrition-balanced-eating',
        title: 'Nutrition and Wellness: A Guide to Balanced Eating',
        category: 'Nutrition',
        author: {
            name: 'Alyce Buck',
            avatar: '/doctor-avatar.jpg'
        },
        date: '21 May 2024',
        readTime: '12 mins read',
        excerpt: 'Good nutrition is the foundation of wellness. Explore tips for creating a balanced diet.',
        content: `
      <p>Good nutrition is the cornerstone of overall wellness and plays a vital role in preventing chronic diseases, maintaining a healthy weight, and supporting mental health. A balanced diet should include a variety of nutrient-dense foods from all food groups. Focus on consuming plenty of colorful fruits and vegetables, which are rich in vitamins, minerals, and antioxidants that protect your body from disease.</p>

      <p>Whole grains provide essential fiber and energy, while lean proteins support muscle growth and repair. Don't forget healthy fats from sources like avocados, nuts, and olive oil, which are crucial for brain health and hormone production. Limiting processed foods, added sugars, and excessive sodium can significantly improve your overall health.</p>

      <h3>Building a Balanced Plate</h3>
      <ul>
        <li><strong>Fill half your plate with vegetables and fruits</strong> - Aim for variety in colors and types</li>
        <li><strong>Quarter of your plate: whole grains</strong> - Brown rice, quinoa, whole wheat bread</li>
        <li><strong>Quarter of your plate: lean protein</strong> - Fish, poultry, beans, tofu</li>
        <li><strong>Include healthy fats</strong> - Nuts, seeds, avocado, olive oil</li>
        <li><strong>Stay hydrated</strong> - Water should be your primary beverage</li>
      </ul>

      <p>Meal planning and preparation can help you maintain healthy eating habits even during busy weeks. Consider preparing meals in advance, keeping healthy snacks readily available, and reading nutrition labels to make informed choices. Remember, sustainable nutrition is about progress, not perfection.</p>
    `,
        image: '/Blog2.jpg',
        tags: ['Nutrition', 'Wellness', 'Health Tips']
    },
    {
        id: 'preventive-health-measures',
        title: 'Top Preventive Health Measures Everyone Should Take',
        category: 'Prevention',
        author: {
            name: 'Bernadette Vogel',
            avatar: '/doctor-avatar.jpg'
        },
        date: '11 May 2024',
        readTime: '9 mins read',
        excerpt: 'Prevention is key to a long, healthy life. Discover the top preventive health measures you can adopt.',
        content: `
      <p>Prevention is key to maintaining long-term health and avoiding serious medical conditions. Regular health screenings are one of the most important preventive measures you can take. These include annual physical exams, blood pressure checks, cholesterol tests, and age-appropriate cancer screenings. Early detection through these screenings can identify potential health issues before they become serious problems.</p>

      <p>Vaccinations are another crucial aspect of preventive health. Staying up-to-date with recommended vaccines protects not only you but also those around you, particularly vulnerable populations. Additionally, maintaining a healthy lifestyle through regular exercise, balanced nutrition, adequate sleep, and stress management forms the foundation of disease prevention.</p>

      <h3>Essential Preventive Health Measures</h3>
      <ul>
        <li><strong>Regular Health Screenings</strong> - Annual physical exams, blood work, and age-appropriate cancer screenings</li>
        <li><strong>Stay Current with Vaccinations</strong> - Flu shots, COVID-19 boosters, and other recommended vaccines</li>
        <li><strong>Maintain a Healthy Weight</strong> - Through balanced diet and regular physical activity</li>
        <li><strong>Don't Smoke and Limit Alcohol</strong> - Avoid tobacco and consume alcohol in moderation</li>
        <li><strong>Practice Good Hygiene</strong> - Regular handwashing and dental care</li>
        <li><strong>Manage Stress</strong> - Through meditation, exercise, or counseling</li>
        <li><strong>Get Adequate Sleep</strong> - 7-9 hours per night for adults</li>
      </ul>

      <p>Building a relationship with a primary care physician is also essential for preventive health. They can provide personalized recommendations based on your age, family history, and risk factors. Don't wait until you're sick to see a doctor – proactive health management is the best investment you can make in your future well-being.</p>
    `,
        image: '/Blog3.jpg',
        tags: ['Prevention', 'Health', 'Wellness']
    }
];

export const featuredBlog = blogPosts[0];
export const recentBlogs = blogPosts.slice(1, 4);
