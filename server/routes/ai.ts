import { Router, Request, Response } from 'express';
import { validateRequest } from '../lib/validation';
import { authenticateToken, requireUser } from '../lib/auth';
import { successResponse, errorResponse } from '../lib/utils';
import prisma from '../lib/database';
import { 
  AITitleSuggestionRequest, 
  AITagSuggestionRequest, 
  AISEORequest,
  AISuggestionResponse 
} from '@shared/api';

const router = Router();

// All AI routes require authentication
router.use(authenticateToken, requireUser);

// Generate title suggestions
router.post('/suggest-title', [
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { content, category }: AITitleSuggestionRequest = req.body;

    // TODO: Integrate with OpenAI or other AI service
    // For now, return mock suggestions based on content analysis
    
    const mockSuggestions = generateMockTitleSuggestions(content, category);
    
    const response: AISuggestionResponse = {
      suggestions: mockSuggestions,
      confidence: 0.85
    };

    // Store suggestion in database for future reference
    await prisma.aISuggestion.create({
      data: {
        type: 'TITLE_SUGGESTION',
        content: response,
        metadata: {
          originalContent: content.substring(0, 200), // Store first 200 chars
          category,
          userId: (req as any).user.userId
        }
      }
    });

    res.json(successResponse(response));
  } catch (error) {
    console.error('Generate title suggestions error:', error);
    res.status(500).json(errorResponse('Failed to generate title suggestions'));
  }
});

// Generate tag suggestions
router.post('/suggest-tags', [
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { title, content, category }: AITagSuggestionRequest = req.body;

    // TODO: Integrate with OpenAI or other AI service
    // For now, return mock suggestions based on content analysis
    
    const mockSuggestions = generateMockTagSuggestions(title, content, category);
    
    const response: AISuggestionResponse = {
      suggestions: mockSuggestions,
      confidence: 0.90
    };

    // Store suggestion in database for future reference
    await prisma.aISuggestion.create({
      data: {
        type: 'TAG_SUGGESTION',
        content: response,
        metadata: {
          originalTitle: title,
          originalContent: content.substring(0, 200),
          category,
          userId: (req as any).user.userId
        }
      }
    });

    res.json(successResponse(response));
  } catch (error) {
    console.error('Generate tag suggestions error:', error);
    res.status(500).json(errorResponse('Failed to generate tag suggestions'));
  }
});

// Generate SEO metadata
router.post('/generate-seo', [
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { title, content, category }: AISEORequest = req.body;

    // TODO: Integrate with OpenAI or other AI service
    // For now, return mock SEO metadata based on content analysis
    
    const mockSEO = generateMockSEOMetadata(title, content, category);
    
    const response = {
      metaTitle: mockSEO.metaTitle,
      metaDescription: mockSEO.metaDescription,
      keywords: mockSEO.keywords,
      structuredData: mockSEO.structuredData,
      confidence: 0.88
    };

    // Store suggestion in database for future reference
    await prisma.aISuggestion.create({
      data: {
        type: 'SEO_METADATA',
        content: response,
        metadata: {
          originalTitle: title,
          originalContent: content.substring(0, 200),
          category,
          userId: (req as any).user.userId
        }
      }
    });

    res.json(successResponse(response));
  } catch (error) {
    console.error('Generate SEO metadata error:', error);
    res.status(500).json(errorResponse('Failed to generate SEO metadata'));
  }
});

// Generate content summary
router.post('/summarize-content', [
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { content, maxLength = 150 } = req.body;

    if (!content || content.length < 50) {
      return res.status(400).json(errorResponse('Content must be at least 50 characters'));
    }

    // TODO: Integrate with OpenAI or other AI service
    // For now, return a simple extractive summary
    
    const summary = generateMockContentSummary(content, maxLength);
    
    const response = {
      summary,
      originalLength: content.length,
      summaryLength: summary.length,
      compressionRatio: (summary.length / content.length * 100).toFixed(1)
    };

    // Store suggestion in database for future reference
    await prisma.aISuggestion.create({
      data: {
        type: 'CONTENT_SUMMARY',
        content: response,
        metadata: {
          originalContent: content.substring(0, 200),
          maxLength,
          userId: (req as any).user.userId
        }
      }
    });

    res.json(successResponse(response));
  } catch (error) {
    console.error('Summarize content error:', error);
    res.status(500).json(errorResponse('Failed to summarize content'));
  }
});

// Improve content readability
router.post('/improve-readability', [
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { content, targetAudience = 'general' } = req.body;

    if (!content || content.length < 100) {
      return res.status(400).json(errorResponse('Content must be at least 100 characters'));
    }

    // TODO: Integrate with OpenAI or other AI service
    // For now, return mock readability improvements
    
    const improvements = generateMockReadabilityImprovements(content, targetAudience);
    
    const response = {
      improvedContent: improvements.improvedContent,
      suggestions: improvements.suggestions,
      readabilityScore: improvements.readabilityScore,
      originalScore: improvements.originalScore,
      improvements: improvements.improvements
    };

    // Store suggestion in database for future reference
    await prisma.aISuggestion.create({
      data: {
        type: 'READABILITY_IMPROVEMENT',
        content: response,
        metadata: {
          originalContent: content.substring(0, 200),
          targetAudience,
          userId: (req as any).user.userId
        }
      }
    });

    res.json(successResponse(response));
  } catch (error) {
    console.error('Improve readability error:', error);
    res.status(500).json(errorResponse('Failed to improve readability'));
  }
});

// Get AI suggestion history for user
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { type, limit = 20 } = req.query;

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const suggestions = await prisma.aISuggestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string) || 20
    });

    const transformedSuggestions = suggestions.map(suggestion => ({
      ...suggestion,
      createdAt: suggestion.createdAt.toISOString()
    }));

    res.json(successResponse(transformedSuggestions));
  } catch (error) {
    console.error('Get AI suggestion history error:', error);
    res.status(500).json(errorResponse('Failed to fetch AI suggestion history'));
  }
});

// Get AI suggestion by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const suggestion = await prisma.aISuggestion.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!suggestion) {
      return res.status(404).json(errorResponse('AI suggestion not found'));
    }

    const transformedSuggestion = {
      ...suggestion,
      createdAt: suggestion.createdAt.toISOString()
    };

    res.json(successResponse(transformedSuggestion));
  } catch (error) {
    console.error('Get AI suggestion error:', error);
    res.status(500).json(errorResponse('Failed to fetch AI suggestion'));
  }
});

// Delete AI suggestion
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const suggestion = await prisma.aISuggestion.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!suggestion) {
      return res.status(404).json(errorResponse('AI suggestion not found'));
    }

    await prisma.aISuggestion.delete({
      where: { id }
    });

    res.json(successResponse(null, 'AI suggestion deleted successfully'));
  } catch (error) {
    console.error('Delete AI suggestion error:', error);
    res.status(500).json(errorResponse('Failed to delete AI suggestion'));
  }
});

// Mock AI functions (replace with actual AI service integration)
function generateMockTitleSuggestions(content: string, category: string): string[] {
  const words = content.toLowerCase().split(/\s+/).slice(0, 20);
  const commonWords = words.filter(word => word.length > 3);
  
  const suggestions = [
    `The Complete Guide to ${category}`,
    `${category} Explained: Everything You Need to Know`,
    `Mastering ${category}: A Comprehensive Tutorial`,
    `Understanding ${category}: From Basics to Advanced`,
    `${category} Best Practices and Tips`
  ];

  // Add some content-based suggestions
  if (commonWords.length > 0) {
    suggestions.push(
      `How to ${commonWords[0]} in ${category}`,
      `${commonWords[0]} vs ${commonWords[1] || 'Alternatives'}: A ${category} Comparison`
    );
  }

  return suggestions.slice(0, 5);
}

function generateMockTagSuggestions(title: string, content: string, category: string): string[] {
  const words = content.toLowerCase().split(/\s+/);
  const commonWords = words.filter(word => word.length > 3 && /^[a-z]+$/.test(word));
  
  const suggestions = [
    category.toLowerCase(),
    ...commonWords.slice(0, 8)
  ];

  // Remove duplicates and limit to 10 tags
  return [...new Set(suggestions)].slice(0, 10);
}

function generateMockSEOMetadata(title: string, content: string, category: string) {
  const metaTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  const metaDescription = content.substring(0, 155) + '...';
  
  const keywords = [
    category.toLowerCase(),
    ...content.toLowerCase().split(/\s+/).filter(word => word.length > 3).slice(0, 8)
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": metaDescription,
    "articleSection": category,
    "keywords": keywords.join(', ')
  };

  return {
    metaTitle,
    metaDescription,
    keywords: [...new Set(keywords)],
    structuredData
  };
}

function generateMockContentSummary(content: string, maxLength: number): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  let summary = '';
  
  for (const sentence of sentences) {
    if ((summary + sentence).length <= maxLength) {
      summary += sentence + '. ';
    } else {
      break;
    }
  }
  
  return summary.trim() || content.substring(0, maxLength) + '...';
}

function generateMockReadabilityImprovements(content: string, targetAudience: string) {
  const words = content.split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const originalScore = Math.max(0, 100 - (words.length / sentences.length) * 2);
  const improvedScore = Math.min(100, originalScore + 15);
  
  const suggestions = [
    'Break long sentences into shorter ones',
    'Use simpler vocabulary where possible',
    'Add more paragraph breaks for better readability',
    'Include bullet points for lists'
  ];

  const improvements = {
    'sentence-length': words.length / sentences.length > 20 ? 'Consider breaking long sentences' : 'Good sentence length',
    'vocabulary': 'Appropriate for target audience',
    'structure': 'Well-organized content',
    'paragraphs': 'Good paragraph structure'
  };

  return {
    improvedContent: content, // In real implementation, this would be the improved version
    suggestions,
    readabilityScore: improvedScore,
    originalScore,
    improvements
  };
}

export default router;
