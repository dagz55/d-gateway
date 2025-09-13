'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useNews } from '@/hooks/api/useNews';
import { ExternalLink, Search } from 'lucide-react';
import { useState } from 'react';

interface NewsFeedProps {
  limit?: number;
}

export default function NewsFeed({ limit }: NewsFeedProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = limit || 10;

  const { data, isLoading, error } = useNews({
    page,
    limit: itemsPerPage,
    search: search || undefined,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Failed to load news. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto News</CardTitle>
        <CardDescription>
          {limit ? `Latest ${limit} news` : 'Stay updated with the latest crypto news'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!limit && (
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(limit || 3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-full bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No news found
          </div>
        ) : (
          <div className="space-y-3">
            {data?.items.map((news) => (
              <div key={news.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold line-clamp-2">{news.title}</h4>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {news.source}
                  </Badge>
                </div>
                
                {news.summary && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {news.summary}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(news.publishedAt)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8"
                  >
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      Read More
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!limit && data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, data.total)} of {data.total} articles
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
