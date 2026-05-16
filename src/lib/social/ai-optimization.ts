// Moteur IA d'optimisation SEO social
// Analyse et génère des recommandations pour optimiser les publications

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai-compatible';
import { AIOptimizationRecommendations } from './types';
import { supabase } from '@/integrations/supabase';

export class AIOptimizationService {
  private static model = openai('gpt-3.5-turbo', {
    baseURL: import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1'
  });

  /**
   * Génère des recommandations complètes pour une publication
   */
  static async analyzePost(
    caption: string,
    hashtags: string[],
    platform: 'facebook' | 'instagram' | 'tiktok',
    analytics?: any
  ): Promise<AIOptimizationRecommendations> {
    try {
      const prompt = this.buildAnalysisPrompt(caption, hashtags, platform, analytics);

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.7,
        maxTokens: 2000,
      });

      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error analyzing post:', error);
      return this.getDefaultRecommendations();
    }
  }

  /**
   * Génère une description SEO optimisée
   */
  static async generateSEODescription(
    caption: string,
    platform: 'facebook' | 'instagram' | 'tiktok'
  ): Promise<string> {
    try {
      const prompt = `You are an expert social media SEO specialist. Optimize the following ${platform} caption for search visibility and engagement. Keep it concise but impactful. Return only the optimized text.

Original caption: "${caption}"`;

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.7,
        maxTokens: 280, // Max for most platforms
      });

      return text;
    } catch (error) {
      console.error('Error generating SEO description:', error);
      return caption;
    }
  }

  /**
   * Génère des hashtags optimisés pour le platform et la niche
   */
  static async generateHashtags(
    caption: string,
    platform: 'facebook' | 'instagram' | 'tiktok',
    count: number = 10
  ): Promise<string[]> {
    try {
      const platformLimits = {
        instagram: 30,
        tiktok: 40,
        facebook: 5,
      };

      const limit = platformLimits[platform];
      const actualCount = Math.min(count, limit);

      const prompt = `Generate ${actualCount} highly relevant hashtags for a ${platform} post. These hashtags should:
- Have high search volume but not be overly competitive
- Be specific to the content niche
- Include mix of popular and long-tail hashtags
- Be formatted as #hashtag

Post content: "${caption}"

Return only the hashtags, one per line, starting with #`;

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.8,
        maxTokens: 500,
      });

      return text
        .split('\n')
        .filter(tag => tag.startsWith('#'))
        .slice(0, actualCount);
    } catch (error) {
      console.error('Error generating hashtags:', error);
      return [];
    }
  }

  /**
   * Génère un titre viral optimisé
   */
  static async generateViralTitle(caption: string, platform: 'facebook' | 'instagram' | 'tiktok'): Promise<string> {
    try {
      const prompt = `Create a viral, engaging title for a ${platform} post that:
- Grabs attention immediately
- Uses power words
- Includes curiosity gap if appropriate
- Is platform-optimized (length and style)
- Relates to: "${caption}"

Return only the title, nothing else.`;

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.9,
        maxTokens: 100,
      });

      return text.trim();
    } catch (error) {
      console.error('Error generating viral title:', error);
      return caption.substring(0, 100);
    }
  }

  /**
   * Analyse le sentiment et suggestion de CTA
   */
  static async analyzeSentimentAndCTA(caption: string, platform: 'facebook' | 'instagram' | 'tiktok'): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    suggestedCTAs: string[];
  }> {
    try {
      const prompt = `Analyze the sentiment of this social media post and suggest 3-5 compelling calls-to-action optimized for ${platform}.

Post: "${caption}"

Respond in JSON format:
{
  "sentiment": "positive|negative|neutral|mixed",
  "suggestedCTAs": ["CTA1", "CTA2", "CTA3"]
}`;

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.7,
        maxTokens: 500,
      });

      try {
        return JSON.parse(text);
      } catch {
        return {
          sentiment: 'neutral',
          suggestedCTAs: ['Like & Share', 'Comment Your Thoughts', 'Follow for More'],
        };
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        sentiment: 'neutral',
        suggestedCTAs: ['Like & Share', 'Comment Your Thoughts', 'Follow for More'],
      };
    }
  }

  /**
   * Détecte l'heure optimale de publication
   */
  static async getOptimalPostingTime(platform: 'facebook' | 'instagram' | 'tiktok'): Promise<string[]> {
    // Statistiques générales par plateforme (à personnaliser selon la niche)
    const optimalTimes = {
      instagram: ['09:00', '12:00', '18:00', '20:00', '21:00'],
      tiktok: ['06:00', '10:00', '14:00', '19:00', '22:00'],
      facebook: ['11:00', '13:00', '17:00', '19:00', '20:00'],
    };

    return optimalTimes[platform] || [];
  }

  /**
   * Prédit le potentiel viral d'une publication
   */
  static async predictViralPotential(
    caption: string,
    hashtags: string[],
    platform: 'facebook' | 'instagram' | 'tiktok'
  ): Promise<number> {
    try {
      const prompt = `Rate the viral potential of this ${platform} post on a scale of 1-100, considering:
- Hook strength
- Emotional appeal
- Call-to-action effectiveness
- Hashtag relevance
- Length and readability

Post: "${caption}"
Hashtags: ${hashtags.join(', ')}

Respond with only a number between 1-100.`;

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.5,
        maxTokens: 10,
      });

      const score = parseInt(text.trim());
      return isNaN(score) ? 50 : Math.max(1, Math.min(100, score));
    } catch (error) {
      console.error('Error predicting viral potential:', error);
      return 50; // Default middle score
    }
  }

  /**
   * Construit le prompt pour l'analyse complète
   */
  private static buildAnalysisPrompt(
    caption: string,
    hashtags: string[],
    platform: string,
    analytics?: any
  ): string {
    return `You are an expert social media strategist. Analyze this ${platform} post and provide detailed optimization recommendations.

Post Caption: "${caption}"
Hashtags: ${hashtags.join(', ')}
${analytics ? `Current Analytics: Views: ${analytics.views}, Likes: ${analytics.likes}, Comments: ${analytics.comments}` : ''}

Provide recommendations in this exact JSON format:
{
  "hooks_score": 0-100,
  "hooks_suggestions": ["suggestion1", "suggestion2"],
  "hashtags_score": 0-100,
  "hashtags_suggestions": ["#hashtag1", "#hashtag2"],
  "posting_time_score": 0-100,
  "optimal_posting_times": ["HH:MM", "HH:MM"],
  "seo_score": 0-100,
  "seo_suggestions": ["suggestion1", "suggestion2"],
  "cta_score": 0-100,
  "cta_suggestions": ["CTA1", "CTA2"],
  "overall_viral_score": 0-100,
  "audience_engagement_prediction": 0-100,
  "estimated_reach": 1000-1000000
}`;
  }

  /**
   * Parse la réponse IA
   */
  private static parseAIResponse(response: string): AIOptimizationRecommendations {
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getDefaultRecommendations();
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        hooks_score: parsed.hooks_score || 50,
        hooks_suggestions: parsed.hooks_suggestions || [],
        hashtags_score: parsed.hashtags_score || 50,
        hashtags_suggestions: parsed.hashtags_suggestions || [],
        posting_time_score: parsed.posting_time_score || 50,
        optimal_posting_times: parsed.optimal_posting_times || [],
        seo_score: parsed.seo_score || 50,
        seo_suggestions: parsed.seo_suggestions || [],
        cta_score: parsed.cta_score || 50,
        cta_suggestions: parsed.cta_suggestions || [],
        overall_viral_score: parsed.overall_viral_score || 50,
        audience_engagement_prediction: parsed.audience_engagement_prediction || 50,
        estimated_reach: parsed.estimated_reach || 5000,
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getDefaultRecommendations();
    }
  }

  /**
   * Retourne des recommandations par défaut
   */
  private static getDefaultRecommendations(): AIOptimizationRecommendations {
    return {
      hooks_score: 50,
      hooks_suggestions: ['Start with a powerful hook', 'Ask an engaging question'],
      hashtags_score: 50,
      hashtags_suggestions: ['#socialmedia', '#marketing', '#engagement'],
      posting_time_score: 50,
      optimal_posting_times: ['09:00', '12:00', '18:00', '20:00'],
      seo_score: 50,
      seo_suggestions: ['Use relevant keywords', 'Optimize for search'],
      cta_score: 50,
      cta_suggestions: ['Like and Share', 'Follow for More', 'Comment Your Thoughts'],
      overall_viral_score: 50,
      audience_engagement_prediction: 50,
      estimated_reach: 5000,
    };
  }

  /**
   * Sauvegarde les recommandations en cache
   */
  static async cacheRecommendations(
    postId: string,
    recommendations: AIOptimizationRecommendations
  ): Promise<void> {
    const { error } = await supabase.from('ai_optimization_cache').insert({
      post_id: postId,
      optimization_type: 'full_analysis',
      scores: {
        hooks: recommendations.hooks_score,
        hashtags: recommendations.hashtags_score,
        posting_time: recommendations.posting_time_score,
        seo: recommendations.seo_score,
        cta: recommendations.cta_score,
        viral: recommendations.overall_viral_score,
      },
      recommendations,
    });

    if (error) {
      console.error('Error caching recommendations:', error);
    }
  }
}

export default AIOptimizationService;
