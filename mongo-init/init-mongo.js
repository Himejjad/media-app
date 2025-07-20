// Create database and user
db = db.getSiblingDB('media-app');

db.createUser({
  user: 'mediaapp',
  pwd: 'mediaapp123',
  roles: [
    {
      role: 'readWrite',
      db: 'media-app'
    }
  ]
});

// Create indexes for better performance
db.media.createIndex({ type: 1, createdAt: -1 });
db.media.createIndex({ createdAt: -1 });
db.media.createIndex({ name: "text" });

print('Database initialized successfully');
