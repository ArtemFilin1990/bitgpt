'use strict';

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory recipe store
let recipes = [
  {
    id: 1,
    title: 'Classic Spaghetti Carbonara',
    category: 'Italian',
    time: 30,
    servings: 4,
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80',
    description: 'A rich and creamy Roman pasta dish made with eggs, Pecorino Romano, guanciale, and black pepper.',
    ingredients: [
      '400g spaghetti',
      '200g guanciale or pancetta',
      '4 large eggs',
      '100g Pecorino Romano, grated',
      'Freshly ground black pepper',
      'Salt for pasta water'
    ],
    steps: [
      'Bring a large pot of salted water to boil and cook spaghetti until al dente.',
      'Fry guanciale in a pan over medium heat until crispy. Remove from heat.',
      'Whisk together eggs and Pecorino Romano in a bowl. Season with black pepper.',
      'Reserve 1 cup of pasta water before draining spaghetti.',
      'Toss hot pasta with guanciale and fat off the heat.',
      'Add egg mixture, tossing quickly and adding pasta water to create a creamy sauce.',
      'Serve immediately with extra cheese and black pepper.'
    ]
  },
  {
    id: 2,
    title: 'Avocado Toast with Poached Eggs',
    category: 'Breakfast',
    time: 15,
    servings: 2,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80',
    description: 'A trendy and nutritious breakfast featuring creamy avocado on crusty sourdough topped with perfectly poached eggs.',
    ingredients: [
      '2 slices sourdough bread',
      '1 ripe avocado',
      '2 eggs',
      '1 lemon, juiced',
      'Red pepper flakes',
      'Salt and pepper',
      'Fresh microgreens (optional)'
    ],
    steps: [
      'Toast sourdough bread until golden and crisp.',
      'Halve, pit, and scoop avocado into a bowl. Mash with lemon juice, salt, and pepper.',
      'Bring a pot of water to a gentle simmer. Add a splash of vinegar.',
      'Crack each egg into a small cup, swirl the water, and slide egg in. Poach for 3 minutes.',
      'Spread mashed avocado on toast and top with poached egg.',
      'Sprinkle with red pepper flakes and microgreens. Serve immediately.'
    ]
  },
  {
    id: 3,
    title: 'Thai Green Curry',
    category: 'Thai',
    time: 40,
    servings: 4,
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
    description: 'A fragrant and vibrant Thai curry with coconut milk, fresh vegetables, and aromatic green curry paste.',
    ingredients: [
      '400ml coconut milk',
      '3 tbsp green curry paste',
      '500g chicken breast, sliced',
      '1 zucchini, sliced',
      '1 red bell pepper, sliced',
      '2 tbsp fish sauce',
      '1 tsp brown sugar',
      'Fresh basil leaves',
      'Jasmine rice to serve'
    ],
    steps: [
      'Heat a wok over high heat and add a splash of the thick coconut cream from the top of the can.',
      'Fry green curry paste in the coconut cream for 2 minutes until fragrant.',
      'Add chicken and stir-fry until it starts to turn white.',
      'Pour in remaining coconut milk and bring to a simmer.',
      'Add vegetables, fish sauce, and sugar. Simmer for 10 minutes.',
      'Taste and adjust seasoning. Stir in fresh basil.',
      'Serve with steamed jasmine rice.'
    ]
  },
  {
    id: 4,
    title: 'Chocolate Lava Cake',
    category: 'Dessert',
    time: 25,
    servings: 4,
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
    description: 'Decadent individual chocolate cakes with a warm, gooey molten center — the ultimate chocolate dessert.',
    ingredients: [
      '200g dark chocolate (70%)',
      '100g unsalted butter',
      '4 eggs + 4 yolks',
      '150g powdered sugar',
      '60g all-purpose flour',
      'Cocoa powder for dusting',
      'Vanilla ice cream to serve'
    ],
    steps: [
      'Preheat oven to 220°C (425°F). Butter and dust 4 ramekins with cocoa powder.',
      'Melt chocolate and butter together in a double boiler. Let cool slightly.',
      'Whisk eggs, yolks, and sugar until pale and thick.',
      'Fold chocolate mixture into egg mixture, then fold in flour.',
      'Divide batter among ramekins and refrigerate for at least 20 minutes.',
      'Bake for 12 minutes — edges should be set but center should jiggle.',
      'Let rest 1 minute, then invert onto plates. Serve with ice cream.'
    ]
  }
];

let nextId = 5;

// GET all recipes (with optional search/filter)
app.get('/api/recipes', (req, res) => {
  const { search, category, difficulty } = req.query;
  let result = recipes;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  }
  if (category) {
    result = result.filter(r => r.category === category);
  }
  if (difficulty) {
    result = result.filter(r => r.difficulty === difficulty);
  }

  res.json(result);
});

// GET single recipe
app.get('/api/recipes/:id', (req, res) => {
  const recipe = recipes.find(r => r.id === parseInt(req.params.id, 10));
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  res.json(recipe);
});

// POST create recipe
app.post('/api/recipes', (req, res) => {
  const { title, category, time, servings, difficulty, image, description, ingredients, steps } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ error: 'title, category, and description are required' });
  }

  const recipe = {
    id: nextId++,
    title,
    category,
    time: parseInt(time, 10) || 30,
    servings: parseInt(servings, 10) || 2,
    difficulty: difficulty || 'Easy',
    image: image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80',
    description,
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    steps: Array.isArray(steps) ? steps : []
  };

  recipes.push(recipe);
  res.status(201).json(recipe);
});

// DELETE recipe
app.delete('/api/recipes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = recipes.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Recipe not found' });
  recipes.splice(index, 1);
  res.status(204).send();
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Recipe app running at http://localhost:${PORT}`);
});

module.exports = app;
