'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { Loader2, Search, Users as UsersIcon, Mail, Shield, ShieldCheck, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Redirect non-admin users
  if (!authLoading && user?.role !== 'ADMIN') {
    router.push('/dashboard');
    return null;
  }

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', search, page],
    queryFn: () => usersService.getUsers({ 
      ...(search && { search }), 
      page, 
      limit: 20 
    }),
    enabled: !!user && user.role === 'ADMIN',
  });

  const deleteMutation = useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-statistics'] });
      toast.success('Utilisateur supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersService.updateUser(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Statut mis à jour');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
            <p className="text-muted-foreground">
              Gérez les utilisateurs de la plateforme
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : usersData?.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Aucun utilisateur trouvé</h3>
                <p className="text-muted-foreground">Aucun utilisateur ne correspond à votre recherche</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData?.data.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {userItem.firstName?.[0]}{userItem.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {userItem.firstName} {userItem.lastName}
                          </div>
                          {userItem._count?.projects !== undefined && (
                            <div className="text-xs text-muted-foreground">
                              {userItem._count.projects} projet(s)
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{userItem.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {userItem.role === 'ADMIN' ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <ShieldCheck className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Shield className="mr-1 h-3 w-3" />
                          Chercheur
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {userItem.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          <XCircle className="mr-1 h-3 w-3" />
                          Inactif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(userItem.createdAt), { addSuffix: true, locale: fr })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: userItem.id,
                              isActive: !userItem.isActive,
                            })
                          }
                          disabled={toggleActiveMutation.isPending || userItem.id === user?.id}
                        >
                          {userItem.isActive ? (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Activer
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(userItem.id)}
                          disabled={deleteMutation.isPending || userItem.id === user?.id}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {usersData && (usersData.totalPages || usersData.meta?.totalPages || 0) > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} sur {usersData.totalPages || usersData.meta?.totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (usersData.totalPages || usersData.meta?.totalPages || 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
