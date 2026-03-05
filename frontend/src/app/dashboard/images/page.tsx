'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagesService } from '@/services/images.service';
import { Loader2, Search, Calendar, Eye, Trash2, Image as ImageIcon, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ImagesPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');

  const { data: imagesData, isLoading } = useQuery({
    queryKey: ['images', search, page, status],
    queryFn: () =>
      imagesService.getImages({
        ...(search && { search }),
        page,
        limit: 12,
        ...(status !== 'all' && { status }),
      }),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: imagesService.deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['image-statistics'] });
      toast.success('Image supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Images</h1>
            <p className="text-muted-foreground">
              Parcourez et gérez vos images de caméras pièges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une image..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="PROCESSING">En traitement</SelectItem>
              <SelectItem value="PROCESSED">Traité</SelectItem>
              <SelectItem value="FAILED">Échoué</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : imagesData?.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Aucune image trouvée</h3>
                <p className="text-muted-foreground">Uploadez des images depuis un projet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {imagesData?.data.map((image) => (
              <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        image.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : image.status === 'PROCESSING'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : image.status === 'FAILED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      )}
                    >
                      {image.status}
                    </span>
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm line-clamp-1">{image.filename}</CardTitle>
                  <CardDescription className="text-xs">
                    {image.project?.name || 'Projet inconnu'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {image.capturedAt && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-2 h-3 w-3" />
                      {new Date(image.capturedAt).toLocaleString('fr-FR')}
                    </div>
                  )}
                  {image._count?.detections !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      {image._count.detections} détection(s)
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Uploadé {formatDistanceToNow(new Date(image.uploadedAt), { addSuffix: true, locale: fr })}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-1 h-3 w-3" />
                      Voir
                    </Button>
                    {image.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(image.url, '_blank')}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(image.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {imagesData && (imagesData.totalPages || imagesData.meta?.totalPages || 0) > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} sur {imagesData.totalPages || imagesData.meta?.totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (imagesData.totalPages || imagesData.meta?.totalPages || 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
