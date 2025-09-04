import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../server/lib/auth';


const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aiblog.com' },
    update: {},
    create: {
      email: 'admin@aiblog.com',
      name: 'Admin User',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      provider: 'EMAIL',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      bio: 'System administrator for the AI Blog platform',
      twitter: 'https://twitter.com/admin',
      github: 'https://github.com/admin',
      linkedin: 'https://linkedin.com/in/admin'
    }
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah@aiblog.com' },
      update: {},
      create: {
        email: 'sarah@aiblog.com',
        name: 'Dr. Sarah Chen',
        username: 'sarahchen',
        password: await hashPassword('password123'),
        role: 'USER',
        provider: 'EMAIL',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        bio: 'AI Researcher at Stanford University, specializing in machine learning and neural networks.',
        twitter: 'https://twitter.com/sarahchen',
        github: 'https://github.com/sarahchen'
      }
    }),
    prisma.user.upsert({
      where: { email: 'alex@aiblog.com' },
      update: {},
      create: {
        email: 'alex@aiblog.com',
        name: 'Alex Rodriguez',
        username: 'alexrod',
        password: await hashPassword('password123'),
        role: 'USER',
        provider: 'EMAIL',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        bio: 'Senior Data Scientist at Google, expert in machine learning algorithms and data analysis.',
        linkedin: 'https://linkedin.com/in/alexrodriguez'
      }
    }),
    prisma.user.upsert({
      where: { email: 'emma@aiblog.com' },
      update: {},
      create: {
        email: 'emma@aiblog.com',
        name: 'Emma Thompson',
        username: 'emmathompson',
        password: await hashPassword('password123'),
        role: 'USER',
        provider: 'EMAIL',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
        bio: 'AI Product Manager at OpenAI, passionate about making AI accessible to everyone.',
        twitter: 'https://twitter.com/emmathompson'
      }
    })
  ]);

  console.log('✅ Sample users created:', users.length);

  // Create sample blogs
  const blogs = await Promise.all([
    prisma.blog.create({
      data: {
        title: 'The Future of Artificial Intelligence: Transforming Industries in 2024',
        excerpt: 'Explore how AI is revolutionizing healthcare, finance, and education with cutting-edge applications and real-world implementations.',
        content: `# The Future of Artificial Intelligence: Transforming Industries in 2024

Artificial Intelligence has evolved from a futuristic concept to a transformative force reshaping industries across the globe. In 2024, we're witnessing unprecedented integration of AI technologies that are fundamentally changing how businesses operate and deliver value to customers.

## Healthcare Revolution

The healthcare industry is experiencing a paradigm shift with AI-powered diagnostic tools, predictive analytics, and personalized treatment plans. Machine learning algorithms can now analyze medical images with accuracy surpassing human radiologists, while natural language processing enables more efficient patient documentation and care coordination.

## Financial Services Transformation

AI is revolutionizing financial services through algorithmic trading, fraud detection, and personalized financial advice. Robo-advisors powered by AI provide investment recommendations tailored to individual risk profiles and financial goals, while advanced fraud detection systems protect consumers from increasingly sophisticated cyber threats.

## Educational Innovation

The education sector is leveraging AI to create personalized learning experiences, adaptive curricula, and intelligent tutoring systems. These technologies can identify learning gaps, adjust content difficulty in real-time, and provide targeted support to students who need it most.

## Manufacturing and Supply Chain

AI-driven predictive maintenance, quality control, and supply chain optimization are reducing costs and improving efficiency in manufacturing. Smart factories equipped with IoT sensors and AI analytics can predict equipment failures before they occur, minimizing downtime and maintenance costs.

## The Road Ahead

As we look toward the future, the integration of AI will continue to accelerate, creating new opportunities and challenges. Organizations that embrace AI transformation while addressing ethical considerations and workforce development will be best positioned to thrive in this new era.

The key to success lies not just in adopting AI technologies, but in developing the organizational capabilities to leverage them effectively. This includes investing in data infrastructure, developing AI talent, and creating governance frameworks that ensure responsible AI deployment.`,
        slug: 'future-of-artificial-intelligence-2024',
        readTime: '8 min read',
        category: 'AI Technology',
        tags: ['AI', 'Technology', 'Future', 'Innovation', 'Healthcare', 'Finance', 'Education'],
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
        status: 'PUBLISHED',
        featured: true,
        publishedAt: new Date('2024-01-15'),
        authorId: users[0].id,
        views: 15420,
        likesCount: 1240,
        commentsCount: 89,
        trendingScore: 95.5
      }
    }),
    prisma.blog.create({
      data: {
        title: 'Machine Learning Algorithms Explained: A Comprehensive Guide',
        excerpt: 'Deep dive into the most important ML algorithms every data scientist should know, with practical examples and implementation tips.',
        content: `# Machine Learning Algorithms Explained: A Comprehensive Guide

Machine learning algorithms form the foundation of modern AI systems, enabling computers to learn patterns from data and make predictions or decisions without explicit programming. Understanding these algorithms is crucial for anyone working in data science, AI, or related fields.

## Supervised Learning Algorithms

### Linear Regression
Linear regression is one of the most fundamental algorithms in machine learning. It models the relationship between a dependent variable and one or more independent variables using a linear function. This algorithm is widely used for prediction tasks in finance, economics, and social sciences.

### Logistic Regression
Despite its name, logistic regression is used for classification problems, not regression. It estimates the probability of an instance belonging to a particular class, making it ideal for binary classification tasks like spam detection or medical diagnosis.

### Decision Trees
Decision trees are intuitive, tree-like models that make decisions based on a series of questions. They're easy to interpret and can handle both classification and regression tasks. However, they're prone to overfitting and may not generalize well to unseen data.

## Unsupervised Learning Algorithms

### K-Means Clustering
K-means is a popular clustering algorithm that groups similar data points together. It's widely used in customer segmentation, image compression, and document clustering. The algorithm iteratively assigns data points to the nearest cluster center and updates the center based on the assigned points.

### Principal Component Analysis (PCA)
PCA is a dimensionality reduction technique that transforms high-dimensional data into a lower-dimensional representation while preserving most of the variance. It's commonly used for data visualization, noise reduction, and feature extraction.

## Deep Learning Algorithms

### Neural Networks
Neural networks are inspired by biological neural networks. It consists of layers of interconnected nodes (neurons) that process input data and produce output predictions. Each connection has an associated weight that gets adjusted during training.

### Convolutional Neural Networks (CNNs)
CNNs are specialized neural networks designed for processing grid-like data, such as images. They use convolutional layers to automatically learn spatial hierarchies of features, making them excellent for computer vision tasks.

## Ensemble Methods

### Random Forest
Random forests combine multiple decision trees to improve prediction accuracy and reduce overfitting. Each tree is trained on a different subset of the data and features, and the final prediction is made by averaging or voting across all trees.

### Gradient Boosting
Gradient boosting builds an ensemble of weak learners sequentially, with each new model correcting the errors of the previous ones. This approach often achieves state-of-the-art performance on many machine learning tasks.

## Choosing the Right Algorithm

Selecting the appropriate algorithm depends on several factors:
- **Problem type**: Classification, regression, or clustering
- **Data characteristics**: Size, quality, and dimensionality
- **Performance requirements**: Accuracy, speed, and interpretability
- **Computational resources**: Available memory and processing power

## Best Practices

1. **Start simple**: Begin with basic algorithms before moving to complex ones
2. **Cross-validation**: Use cross-validation to assess model performance
3. **Feature engineering**: Invest time in creating meaningful features
4. **Hyperparameter tuning**: Optimize algorithm parameters for better performance
5. **Interpretability**: Consider the trade-off between accuracy and interpretability

## Conclusion

Machine learning algorithms are powerful tools that can extract valuable insights from data and automate complex decision-making processes. By understanding the strengths and limitations of different algorithms, practitioners can choose the most appropriate approach for their specific use case and achieve better results.

The field of machine learning is constantly evolving, with new algorithms and techniques being developed regularly. Staying updated with the latest developments and understanding the fundamental principles will help you adapt to new challenges and opportunities in this dynamic field.`,
        slug: 'machine-learning-algorithms-comprehensive-guide',
        readTime: '12 min read',
        category: 'Machine Learning',
        tags: ['Machine Learning', 'Algorithms', 'Data Science', 'Neural Networks', 'Deep Learning'],
        coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
        status: 'PUBLISHED',
        featured: true,
        publishedAt: new Date('2024-01-10'),
        authorId: users[1].id,
        views: 8930,
        likesCount: 720,
        commentsCount: 45,
        trendingScore: 87.2
      }
    }),
    prisma.blog.create({
      data: {
        title: 'Building Your First Neural Network with PyTorch',
        excerpt: 'Step-by-step tutorial for beginners to create and train their first neural network using PyTorch framework.',
        content: `# Building Your First Neural Network with PyTorch

PyTorch has become one of the most popular deep learning frameworks, known for its dynamic computational graphs and intuitive Python-like syntax. This tutorial will guide you through building your first neural network from scratch, covering the fundamentals of PyTorch and deep learning.

## Prerequisites

Before we begin, ensure you have the following installed:
- Python 3.7+
- PyTorch
- NumPy
- Matplotlib (for visualization)

You can install PyTorch using pip:
\`\`\`bash
pip install torch torchvision torchaudio
\`\`\`

## Understanding Neural Networks

A neural network is a computational model inspired by biological neural networks. It consists of layers of interconnected nodes (neurons) that process input data and produce output predictions. Each connection has an associated weight that gets adjusted during training.

## Setting Up the Environment

Let's start by importing the necessary libraries and setting up our environment:

\`\`\`python
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import matplotlib.pyplot as plt

# Set random seed for reproducibility
torch.manual_seed(42)
np.random.seed(42)
\`\`\`

## Creating the Dataset

For this tutorial, we'll create a simple synthetic dataset. In practice, you'd typically work with real-world data:

\`\`\`python
# Generate synthetic data
X = torch.randn(1000, 2)  # 1000 samples with 2 features
y = torch.sin(X[:, 0]) + torch.cos(X[:, 1])  # Simple function

# Split into training and validation sets
train_size = int(0.8 * len(X))
X_train, X_val = X[:train_size], X[train_size:]
y_train, y_val = y[:train_size], y[train_size:]
\`\`\`

## Building the Neural Network

Now let's create our first neural network using PyTorch's nn.Module:

\`\`\`python
class SimpleNeuralNetwork(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(SimpleNeuralNetwork, self).__init__()
        
        # Define layers
        self.layer1 = nn.Linear(input_size, hidden_size)
        self.layer2 = nn.Linear(hidden_size, hidden_size)
        self.layer3 = nn.Linear(hidden_size, output_size)
        
        # Activation function
        self.relu = nn.ReLU()
        
    def forward(self, x):
        # Forward pass through the network
        x = self.relu(self.layer1(x))
        x = self.relu(self.layer2(x))
        x = self.layer3(x)
        return x

# Initialize the model
input_size = 2
hidden_size = 64
output_size = 1
model = SimpleNeuralNetwork(input_size, hidden_size, output_size)
\`\`\`

## Training the Model

Now let's train our neural network:

\`\`\`python
# Define loss function and optimizer
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training loop
num_epochs = 1000
train_losses = []
val_losses = []

for epoch in range(num_epochs):
    # Training phase
    model.train()
    optimizer.zero_grad()
    
    # Forward pass
    outputs = model(X_train)
    loss = criterion(outputs.squeeze(), y_train)
    
    # Backward pass and optimization
    loss.backward()
    optimizer.step()
    
    # Validation phase
    model.eval()
    with torch.no_grad():
        val_outputs = model(X_val)
        val_loss = criterion(val_outputs.squeeze(), y_val)
    
    # Record losses
    train_losses.append(loss.item())
    val_losses.append(val_loss.item())
    
    # Print progress
    if (epoch + 1) % 100 == 0:
        print(f'Epoch [{epoch+1}/{num_epochs}], Train Loss: {loss.item():.4f}, Val Loss: {val_loss.item():.4f}')
\`\`\`

## Evaluating the Model

Let's assess how well our model performs:

\`\`\`python
# Evaluate on validation set
model.eval()
with torch.no_grad():
    val_predictions = model(X_val)
    mse = criterion(val_predictions.squeeze(), y_val)
    print(f'Final Validation MSE: {mse.item():.4f}')

# Plot training progress
plt.figure(figsize=(10, 6))
plt.plot(train_losses, label='Training Loss')
plt.plot(val_losses, label='Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('Training and Validation Loss')
plt.legend()
plt.grid(True)
plt.show()
\`\`\`

## Making Predictions

Now you can use your trained model to make predictions:

\`\`\`python
# Create new data for prediction
new_data = torch.randn(5, 2)
model.eval()
with torch.no_grad():
    predictions = model(new_data)
    print('Predictions:', predictions.squeeze().numpy())
\`\`\`

## Key Concepts Learned

1. **Layers**: Neural networks consist of multiple layers that transform input data
2. **Activation Functions**: ReLU and other activation functions introduce non-linearity
3. **Loss Function**: Measures how well the model is performing
4. **Optimizer**: Updates model parameters to minimize the loss
5. **Training Loop**: Iterative process of forward pass, loss calculation, and parameter updates

## Next Steps

This tutorial covered the basics of building a neural network with PyTorch. To expand your knowledge, consider:

- Experimenting with different architectures
- Adding regularization techniques (dropout, batch normalization)
- Working with real datasets
- Implementing more complex architectures like CNNs or RNNs
- Understanding advanced optimization techniques

## Conclusion

Congratulations! You've successfully built and trained your first neural network with PyTorch. This foundation will serve you well as you explore more advanced deep learning concepts and applications.

Remember that deep learning is both an art and a science. Practice, experimentation, and continuous learning are key to mastering this exciting field.`,
        slug: 'building-first-neural-network-pytorch',
        readTime: '15 min read',
        category: 'Deep Learning',
        tags: ['PyTorch', 'Neural Networks', 'Deep Learning', 'Tutorial', 'Python'],
        coverImage: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=400&fit=crop',
        status: 'PUBLISHED',
        featured: false,
        publishedAt: new Date('2024-01-05'),
        authorId: users[2].id,
        views: 12500,
        likesCount: 980,
        commentsCount: 67,
        trendingScore: 82.1
      }
    })
  ]);

  console.log('✅ Sample blogs created:', blogs.length);

  // Create sample comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Excellent article! The section on healthcare AI applications was particularly insightful.',
        blogId: blogs[0].id,
        userId: users[1].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'Great overview of ML algorithms. Would love to see more practical examples in future posts.',
        blogId: blogs[1].id,
        userId: users[2].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'This tutorial helped me understand PyTorch basics. Clear and well-structured!',
        blogId: blogs[2].id,
        userId: users[0].id
      }
    })
  ]);

  console.log('✅ Sample comments created:', comments.length);

  // Create sample notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        type: 'NEW_COMMENT',
        title: 'New comment on your blog',
        message: 'Alex Rodriguez commented on your blog "The Future of Artificial Intelligence"',
        userId: users[0].id,
        blogId: blogs[0].id,
        commentId: comments[0].id
      }
    }),
    prisma.notification.create({
      data: {
        type: 'BLOG_APPROVED',
        title: 'Blog approved',
        message: 'Your blog "Machine Learning Algorithms Explained" has been approved and published!',
        userId: users[1].id,
        blogId: blogs[1].id
      }
    })
  ]);

  console.log('✅ Sample notifications created:', notifications.length);

  // Create sample AI suggestions
  const aiSuggestions = await Promise.all([
    prisma.aISuggestion.create({
      data: {
        type: 'TITLE_SUGGESTION',
        content: {
          suggestions: [
            'AI in 2024: Industry Transformations',
            'How AI is Reshaping Business in 2024',
            'The AI Revolution: 2024 Industry Impact'
          ],
          confidence: 0.85
        },
        metadata: {
          originalContent: 'The Future of Artificial Intelligence...',
          category: 'AI Technology',
          userId: users[0].id
        }
      }
    })
  ]);

  console.log('✅ Sample AI suggestions created:', aiSuggestions.length);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Note: Admin promotion logic moved to prisma/promote-admin.ts
