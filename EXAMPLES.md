# ACAB - API Usage Examples

## 📚 Complete Examples for Using ACAB Services

---

## 1. React Component - Connect Social Accounts

```tsx
import { SocialAccountsManager } from '@/components/social/SocialAccountsManager';

export function SocialPage() {
  return (
    <div className="space-y-6">
      <h1>Manage Your Social Accounts</h1>
      <SocialAccountsManager />
    </div>
  );
}
```

---

## 2. React Component - List and Manage Posts

```tsx
import { useSocialPosts } from '@/hooks/use-social-accounts';
import { SocialPostsManager } from '@/components/social/SocialPostsManager';

export function PostsPage({ accountId }: { accountId: string }) {
  const { posts, isLoading, deletePost, publishPost } = useSocialPosts(accountId);

  if (isLoading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div>
      <h2>Posts</h2>
      <SocialPostsManager accountId={accountId} />
      
      <div className="mt-8">
        <h3>Recent Posts</h3>
        {posts.map(post => (
          <div key={post.id} className="border p-4 rounded">
            <p>{post.caption}</p>
            <p className="text-sm text-gray-500">{post.status}</p>
            {post.status === 'draft' && (
              <button onClick={() => publishPost({ 
                postId: post.id, 
                externalId: undefined 
              })}>
                Publish
              </button>
            )}
            <button onClick={() => deletePost(post.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. React Hook - Get User's Accounts

```tsx
import { useSocialAccounts } from '@/hooks/use-social-accounts';

export function MyAccounts() {
  const {
    accounts,
    isLoading,
    deleteAccount,
    createAccount,
    updateAccount,
  } = useSocialAccounts();

  const handleAddAccount = () => {
    createAccount({
      user_id: 'current-user-id',
      platform: 'tiktok',
      account_name: 'My TikTok',
      account_id: '@mytiktok',
      access_token: 'token...',
      token_type: 'Bearer',
      connected: true,
      followers_count: 1000,
      verified: false,
      metadata: {},
    });
  };

  return (
    <div>
      {accounts.map(account => (
        <div key={account.id}>
          <h3>{account.account_name}</h3>
          <p>Platform: {account.platform}</p>
          <p>Followers: {account.followers_count}</p>
          <button onClick={() => deleteAccount(account.id)}>
            Remove
          </button>
        </div>
      ))}
      <button onClick={handleAddAccount}>Add Account</button>
    </div>
  );
}
```

---

## 4. TypeScript - Direct Service Usage

```typescript
import {
  SocialAccountsService,
  SocialPostsService,
  AIOptimizationService
} from '@/lib/social';

// Get user's accounts
async function getUserAccounts(userId: string) {
  const accounts = await SocialAccountsService.getUserAccounts(userId);
  console.log(accounts);
  return accounts;
}

// Create a post
async function createNewPost(accountId: string) {
  const post = await SocialPostsService.createPost({
    account_id: accountId,
    platform: 'instagram',
    caption: 'Check out my new post! 🚀',
    hashtags: ['#marketing', '#business'],
    media_urls: ['https://...image.jpg'],
    media_types: ['image'],
    status: 'draft',
    cross_posted: false,
    cross_posted_platforms: [],
    analytics: {},
    metadata: {},
  });
  
  return post;
}

// Get AI recommendations
async function optimizePost(caption: string, hashtags: string[]) {
  const recommendations = 
    await AIOptimizationService.analyzePost(
      caption,
      hashtags,
      'instagram'
    );
  
  console.log('Viral Score:', recommendations.overall_viral_score);
  console.log('Suggestions:', recommendations.hooks_suggestions);
  
  return recommendations;
}

// Usage
(async () => {
  const accounts = await getUserAccounts('user-123');
  if (accounts.length > 0) {
    const post = await createNewPost(accounts[0].id);
    const optimized = await optimizePost(
      post.caption!,
      post.hashtags
    );
  }
})();
```

---

## 5. OAuth Flow - Manual Implementation

```typescript
import { OAuthService } from '@/lib/social';

// Generate OAuth URL (send user to this)
function getOAuthUrl(platform: 'facebook' | 'instagram' | 'tiktok') {
  const url = OAuthService.getAuthUrl(platform);
  console.log('Send user to:', url);
  // window.location.href = url;
}

// Handle callback
async function handleOAuthCallback(code: string, platform: string) {
  const token = await OAuthService.exchangeCodeForToken(
    platform as 'facebook' | 'instagram' | 'tiktok',
    code
  );
  
  console.log('Token:', token);
  
  // Save to database
  const account = await SocialAccountsService.createAccount({
    user_id: 'current-user-id',
    platform: platform as 'facebook' | 'instagram' | 'tiktok',
    account_name: 'New Account',
    account_id: 'account-123',
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    token_expires_at: token.expires_in
      ? new Date(Date.now() + token.expires_in * 1000).toISOString()
      : undefined,
    token_type: token.token_type || 'Bearer',
    scope: token.scope,
    connected: true,
    followers_count: 0,
    verified: false,
    metadata: token,
  });
  
  return account;
}

// Token refresh
async function refreshAccessToken(
  accountId: string,
  platform: 'facebook' | 'instagram' | 'tiktok'
) {
  const account = await SocialAccountsService.getAccount(accountId);
  
  if (!account.refresh_token) {
    throw new Error('No refresh token available');
  }
  
  const newToken = await OAuthService.refreshToken(
    platform,
    account.refresh_token
  );
  
  await SocialAccountsService.updateToken(
    accountId,
    newToken.access_token,
    newToken.refresh_token,
    newToken.expires_in
      ? new Date(Date.now() + newToken.expires_in * 1000).toISOString()
      : undefined
  );
}
```

---

## 6. API Clients - Call Social Platforms

```typescript
import {
  FacebookAPI,
  InstagramAPI,
  TikTokAPI
} from '@/lib/social/platforms';

// Facebook
async function facebookExample(accessToken: string) {
  const api = new FacebookAPI(accessToken);
  
  // Get user profile
  const profile = await api.getUserProfile();
  console.log('Profile:', profile);
  
  // Get pages
  const pages = await api.getPages();
  console.log('Pages:', pages);
  
  // Get posts
  const posts = await api.getPagePosts(pages[0].id);
  console.log('Posts:', posts);
  
  // Create post
  const newPost = await api.createPost(
    pages[0].id,
    'Hello Facebook! 👋'
  );
  console.log('Created:', newPost);
  
  // Get insights
  const insights = await api.getPageInsights(pages[0].id);
  console.log('Insights:', insights);
}

// Instagram
async function instagramExample(accessToken: string, businessAccountId: string) {
  const api = new InstagramAPI(accessToken, businessAccountId);
  
  // Get profile
  const profile = await api.getUserProfile();
  console.log('Profile:', profile);
  
  // Get media
  const media = await api.getMedia();
  console.log('Media:', media);
  
  // Get media insights
  if (media.length > 0) {
    const insights = await api.getMediaInsights(media[0].id);
    console.log('Insights:', insights);
  }
  
  // Create post (container method)
  const post = await api.createPost(
    'https://example.com/image.jpg',
    'Check this out!',
    'IMAGE'
  );
  console.log('Created:', post);
}

// TikTok
async function tiktokExample(accessToken: string) {
  const api = new TikTokAPI(accessToken);
  
  // Get user info
  const info = await api.getUserInfo();
  console.log('User:', info);
  
  // Get videos
  const videos = await api.getUserVideos();
  console.log('Videos:', videos);
  
  // Get video analytics
  if (videos.length > 0) {
    const analytics = await api.getVideoAnalytics(videos[0].video_id);
    console.log('Analytics:', analytics);
  }
}
```

---

## 7. AI Features - Content Optimization

```typescript
import { AIOptimizationService } from '@/lib/social/ai-optimization';

async function aiOptimizationExample() {
  const caption = 'Just launched my new product! 🎉';
  const hashtags = ['#product', '#launch'];
  
  // Full analysis
  const analysis = await AIOptimizationService.analyzePost(
    caption,
    hashtags,
    'tiktok'
  );
  console.log('Full Analysis:', analysis);
  // {
  //   hooks_score: 75,
  //   hooks_suggestions: [...],
  //   overall_viral_score: 72,
  //   estimated_reach: 250000,
  //   ...
  // }
  
  // Generate SEO description
  const seoDesc = await AIOptimizationService.generateSEODescription(
    caption,
    'instagram'
  );
  console.log('SEO:', seoDesc);
  
  // Generate hashtags
  const tags = await AIOptimizationService.generateHashtags(
    caption,
    'instagram',
    20
  );
  console.log('Tags:', tags);
  // ['#innovation', '#technology', ...]
  
  // Generate viral title
  const title = await AIOptimizationService.generateViralTitle(
    caption,
    'tiktok'
  );
  console.log('Title:', title);
  
  // Analyze sentiment
  const sentiment = await AIOptimizationService.analyzeSentimentAndCTA(
    caption,
    'facebook'
  );
  console.log('Sentiment:', sentiment);
  // {
  //   sentiment: 'positive',
  //   suggestedCTAs: ['Discover More', 'Learn More', ...]
  // }
  
  // Get optimal times
  const times = await AIOptimizationService.getOptimalPostingTime('tiktok');
  console.log('Best times:', times);
  // ['06:00', '10:00', '14:00', ...]
  
  // Predict viral potential
  const viralScore = await AIOptimizationService.predictViralPotential(
    caption,
    hashtags,
    'tiktok'
  );
  console.log('Viral Score:', viralScore); // 1-100
}
```

---

## 8. Synchronization - Sync Data

```typescript
import { SocialSyncService } from '@/lib/social/sync';

async function syncExample(userId: string) {
  // Sync all user accounts
  await SocialSyncService.syncUserAccounts(userId);
  console.log('All accounts synced!');
  
  // Sync specific account
  const accounts = await SocialAccountsService.getUserAccounts(userId);
  if (accounts.length > 0) {
    await SocialSyncService.syncAccount(accounts[0]);
    console.log('Account synced!');
  }
  
  // Check sync results
  const posts = await SocialPostsService.getAccountPosts(accounts[0].id);
  console.log('Synced posts:', posts.length);
}
```

---

## 9. Database Queries - Direct Access

```typescript
import { supabase } from '@/integrations/supabase';

// Get all accounts
const { data: accounts } = await supabase
  .from('social_accounts')
  .select('*')
  .eq('connected', true);

// Get posts with analytics
const { data: posts } = await supabase
  .from('social_posts')
  .select('*, analytics:social_analytics(*)')
  .eq('status', 'published')
  .order('published_at', { ascending: false });

// Get comments on posts
const { data: comments } = await supabase
  .from('social_comments')
  .select('*')
  .eq('post_id', postId)
  .eq('sentiment', 'positive');

// Get daily analytics
const { data: analytics } = await supabase
  .from('social_analytics')
  .select('*')
  .gte('date', '2026-05-01')
  .lte('date', '2026-05-31');
```

---

## 10. Full Page Example

```tsx
import { useEffect, useState } from 'react';
import { useSocialAccounts, useSocialPosts } from '@/hooks/use-social-accounts';
import { AIOptimizationService } from '@/lib/social/ai-optimization';

export function SocialDashboard() {
  const { accounts, isLoading: accountsLoading } = useSocialAccounts();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const { posts } = useSocialPosts(selectedAccount || undefined);
  const [recommendations, setRecommendations] = useState<any>(null);

  useEffect(() => {
    if (selectedAccount && posts.length > 0) {
      const post = posts[0];
      AIOptimizationService.analyzePost(
        post.caption || '',
        post.hashtags,
        post.platform
      ).then(setRecommendations);
    }
  }, [selectedAccount, posts]);

  if (accountsLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1>Social Media Dashboard</h1>
      
      <div>
        <h2>Your Accounts</h2>
        {accounts.map(account => (
          <button
            key={account.id}
            onClick={() => setSelectedAccount(account.id)}
            className={selectedAccount === account.id ? 'bg-blue-500' : ''}
          >
            {account.account_name} ({account.platform})
          </button>
        ))}
      </div>

      {selectedAccount && (
        <>
          <div>
            <h2>Posts</h2>
            {posts.map(post => (
              <div key={post.id} className="border p-4">
                <p>{post.caption}</p>
                <p className="text-sm">{post.status}</p>
              </div>
            ))}
          </div>

          {recommendations && (
            <div>
              <h2>AI Recommendations</h2>
              <p>Viral Score: {recommendations.overall_viral_score}/100</p>
              <ul>
                {recommendations.hooks_suggestions?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

## 📚 Quick Reference

### Main Services
- `SocialAccountsService` - Manage connected accounts
- `SocialPostsService` - Create & manage posts
- `SocialCommentsService` - Handle comments
- `SocialAnalyticsService` - Record & retrieve analytics
- `SocialSyncService` - Sync data from platforms
- `AIOptimizationService` - Generate recommendations

### Main Hooks
- `useSocialAccounts()` - Get user's accounts
- `useSocialPosts(accountId)` - Get account's posts
- `useSocialComments(postId)` - Get post's comments
- `useSocialAnalytics(accountId, startDate, endDate)` - Get analytics
- `usePlatformAccounts(platform)` - Get accounts of specific platform

### Main Components
- `SocialAccountsManager` - UI for connecting accounts
- `SocialPostsManager` - UI for managing posts

---

**Ready to start? See QUICKSTART.md for setup instructions! 🚀**
