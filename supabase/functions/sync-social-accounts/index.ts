// Edge Function Supabase: Synchronisation sociale périodique
// Appelée par un cron job pour synchroniser les comptes sociaux

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

interface SocialAccount {
  id: string
  user_id: string
  platform: string
  account_name: string
  account_id: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
  connected: boolean
}

serve(async (req) => {
  // Vérifier l'authentification
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('SYNC_CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Récupérer tous les comptes connectés
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('connected', true)

    if (error) throw error

    console.log(`Synchronizing ${accounts?.length || 0} accounts`)

    // Traiter chaque compte
    for (const account of accounts || []) {
      await syncAccount(account)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        accountsSynced: accounts?.length || 0 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (err) {
    console.error('Sync error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function syncAccount(account: SocialAccount) {
  try {
    // Vérifier l'expiration du token
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      console.log(`Token expired for ${account.account_name}`)
      
      // Essayer de rafraîchir le token
      if (account.refresh_token) {
        await refreshToken(account)
      } else {
        // Marquer comme déconnecté
        await supabase
          .from('social_accounts')
          .update({ connected: false })
          .eq('id', account.id)
        return
      }
    }

    // Synchroniser selon la plateforme
    switch (account.platform) {
      case 'facebook':
        await syncFacebookAccount(account)
        break
      case 'instagram':
        await syncInstagramAccount(account)
        break
      case 'tiktok':
        await syncTikTokAccount(account)
        break
    }

    // Mettre à jour last_sync_at
    await supabase
      .from('social_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', account.id)

    console.log(`Synced ${account.platform} account: ${account.account_name}`)
  } catch (err) {
    console.error(`Error syncing ${account.account_name}:`, err)
    
    // Enregistrer l'erreur
    await supabase
      .from('social_sync_queue')
      .insert({
        account_id: account.id,
        sync_type: 'posts',
        status: 'failed',
        error_message: err.message,
        retry_count: 0,
        next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      })
  }
}

async function syncFacebookAccount(account: SocialAccount) {
  // Appel à l'API Facebook pour récupérer les posts
  const url = `https://graph.facebook.com/v19.0/${account.account_id}/posts?fields=id,created_time,message,shares,likes.summary(total_count)&access_token=${account.access_token}`
  
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Facebook API error: ${response.statusText}`)
  
  const data = await response.json()
  
  for (const post of data.data || []) {
    await syncFacebookPost(account, post)
  }
}

async function syncInstagramAccount(account: SocialAccount) {
  // Appel à l'API Instagram pour récupérer les médias
  const url = `https://graph.instagram.com/v19.0/${account.account_id}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count&access_token=${account.access_token}`
  
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Instagram API error: ${response.statusText}`)
  
  const data = await response.json()
  
  for (const media of data.data || []) {
    await syncInstagramMedia(account, media)
  }
}

async function syncTikTokAccount(account: SocialAccount) {
  // Appel à l'API TikTok pour récupérer les vidéos
  const url = `https://open.tiktokapis.com/v1/video/list/`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${account.access_token}`
    }
  })
  
  if (!response.ok) throw new Error(`TikTok API error: ${response.statusText}`)
  
  const data = await response.json()
  
  for (const video of data.data?.videos || []) {
    await syncTikTokVideo(account, video)
  }
}

async function syncFacebookPost(account: SocialAccount, post: any) {
  const { data: existing } = await supabase
    .from('social_posts')
    .select('id')
    .eq('account_id', account.id)
    .eq('external_post_id', post.id)
    .single()

  if (!existing) {
    await supabase.from('social_posts').insert({
      account_id: account.id,
      external_post_id: post.id,
      platform: 'facebook',
      caption: post.message || '',
      status: 'published',
      published_at: post.created_time,
      analytics: {
        likes: post.likes?.summary?.total_count || 0,
        shares: post.shares?.count || 0
      }
    })
  }
}

async function syncInstagramMedia(account: SocialAccount, media: any) {
  const { data: existing } = await supabase
    .from('social_posts')
    .select('id')
    .eq('account_id', account.id)
    .eq('external_post_id', media.id)
    .single()

  if (!existing) {
    await supabase.from('social_posts').insert({
      account_id: account.id,
      external_post_id: media.id,
      platform: 'instagram',
      caption: media.caption || '',
      media_urls: [media.media_url],
      media_types: [media.media_type.toLowerCase()],
      status: 'published',
      published_at: media.timestamp,
      analytics: {
        likes: media.like_count || 0,
        comments: media.comments_count || 0
      }
    })
  }
}

async function syncTikTokVideo(account: SocialAccount, video: any) {
  const { data: existing } = await supabase
    .from('social_posts')
    .select('id')
    .eq('account_id', account.id)
    .eq('external_post_id', video.video_id)
    .single()

  if (!existing) {
    await supabase.from('social_posts').insert({
      account_id: account.id,
      external_post_id: video.video_id,
      platform: 'tiktok',
      caption: video.title || '',
      media_urls: [video.video_url],
      media_types: ['video'],
      status: 'published',
      published_at: new Date(video.create_time * 1000).toISOString()
    })
  }
}

async function refreshToken(account: SocialAccount) {
  if (!account.refresh_token) throw new Error('No refresh token')

  const tokenEndpoints: Record<string, string> = {
    facebook: 'https://graph.facebook.com/v19.0/oauth/access_token',
    instagram: 'https://graph.instagram.com/v19.0/refresh_access_token',
    tiktok: 'https://open.tiktokapis.com/v1/oauth/token'
  }

  const body = new FormData()
  body.append('client_id', Deno.env.get(`${account.platform.toUpperCase()}_APP_ID`) || '')
  body.append('client_secret', Deno.env.get(`${account.platform.toUpperCase()}_APP_SECRET`) || '')
  body.append('grant_type', 'refresh_token')
  body.append('refresh_token', account.refresh_token)

  const response = await fetch(tokenEndpoints[account.platform], {
    method: 'POST',
    body
  })

  if (!response.ok) throw new Error(`Token refresh failed: ${response.statusText}`)

  const data = await response.json()

  await supabase
    .from('social_accounts')
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token || account.refresh_token,
      token_expires_at: data.expires_in 
        ? new Date(Date.now() + data.expires_in * 1000).toISOString() 
        : null
    })
    .eq('id', account.id)
}
