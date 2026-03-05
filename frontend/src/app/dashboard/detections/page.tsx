'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { detectionsService } from '@/services/detections.service';
import { Loader2, Search, Camera, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function DetectionsPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');

  const { data: detectionsData, isLoading } = useQuery({
    queryKey: ['detections', search, page, status],
    queryFn: () =>
      detectionsService.getDetections({
        ...(search && { search }),
        page,
        limit: 20,
        ...(status !== 'all' && { status }),
      }),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: detectionsService.deleteDetection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detections'] });
      queryClient.invalidateQueries({ queryKey: ['detection-statistics'] });
      toast.success('Détection supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const validateMutation = useMutation({
    mutationFn: ({ id, validated }: { id: string; validated: boolean }) =>
      detectionsService.updateDetection(id, { validated }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detections'] });
      queryClient.invalidateQueries({ queryKey: ['detection-statistics'] });
      toast.success('Détection mise à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="bg-green-500">Haute ({Math.round(confidence * 100)}%)</Badge>;
    } else if (confidence >= 0.5) {
      return <Badge className="bg-yellow-500">Moyenne ({Math.round(confidence * 100)}%)</Badge>;
    } else {
      return <Badge className="bg-red-500">Faible ({Math.round(confidence * 100)}%)</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Détections</h1>
            <p className="text-muted-foreground">
              Validez et gérez les détections d'animaux
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par espèce..."
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
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="validated">Validées</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : detectionsData?.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Camera className="h-12 w-12 text-muted-foreground mb-4" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Aucune détection trouvée</h3>
                <p className="text-muted-foreground">Les détections apparaîtront après traitement des images</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {detectionsData?.data.map((detection) => (
              <Card key={detection.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-32 h-32 bg-muted rounded-lg overflow-hidden">
                      {detection.image?.url ? (
                        <img
                          src={detection.image.url}
                          alt={detection.species?.name || 'Detection'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{detection.species?.name || 'Espèce inconnue'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {detection.image?.filename || 'Image inconnue'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {detection.validated ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Validée
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              En attente
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div>Confiance: {getConfidenceBadge(detection.confidence)}</div>
                        {detection.boundingBox && (
                          <div className="text-xs">
                            Position: ({Math.round(detection.boundingBox.x)}, {Math.round(detection.boundingBox.y)})
                          </div>
                        )}
                      </div>
                      {detection.metadata && Object.keys(detection.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Métadonnées: {JSON.stringify(detection.metadata)}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Détectée {formatDistanceToNow(new Date(detection.detectedAt), { addSuffix: true, locale: fr })}
                      </div>
                      <div className="flex gap-2 pt-2">
                        {!detection.validated ? (
                          <Button
                            size="sm"
                            onClick={() => validateMutation.mutate({ id: detection.id, validated: true })}
                            disabled={validateMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Valider
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => validateMutation.mutate({ id: detection.id, validated: false })}
                            disabled={validateMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Invalider
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(detection.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {detectionsData && (detectionsData.totalPages || detectionsData.meta?.totalPages || 0) > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} sur {detectionsData.totalPages || detectionsData.meta?.totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (detectionsData.totalPages || detectionsData.meta?.totalPages || 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
