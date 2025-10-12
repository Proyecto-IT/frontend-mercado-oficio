import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { oficioService, Oficio } from "@/services/oficioService";

const ManageOccupations = () => {
  const [occupations, setOccupations] = useState<Oficio[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOccupation, setEditingOccupation] = useState<Oficio | null>(null);
  const [nombre, setNombre] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadOccupations = async () => {
    try {
      setIsLoading(true);
      const data = await oficioService.ListarTodos();
      setOccupations(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los oficios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del oficio es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      if (editingOccupation) {
        await oficioService.update({ id: editingOccupation.id, nombre });
        toast({
          title: "Éxito",
          description: "Oficio actualizado correctamente",
        });
      } else {
        await oficioService.create({ nombre });
        toast({
          title: "Éxito",
          description: "Oficio creado correctamente",
        });
      }

      handleCloseDialog();
      await loadOccupations();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "No se pudo guardar el oficio";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este oficio?")) return;

    try {
      setIsLoading(true);
      await oficioService.delete(id);
      toast({
        title: "Éxito",
        description: "Oficio eliminado correctamente",
      });
      await loadOccupations();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "No se pudo eliminar el oficio";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (occupation: Oficio) => {
    setEditingOccupation(occupation);
    setNombre(occupation.nombre);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingOccupation(null);
    setNombre("");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNombre("");
    setEditingOccupation(null);
  };

  useEffect(() => {
    loadOccupations();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Gestionar Oficios</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate} disabled={isLoading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Oficio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingOccupation ? "Editar Oficio" : "Crear Nuevo Oficio"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Oficio</Label>
                    <Input
                      id="name"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Carpintería"
                      disabled={isLoading}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                  </div>
                  <Button 
                    onClick={handleSave} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Guardando..." : editingOccupation ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading && occupations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando oficios...
              </div>
            ) : occupations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay oficios registrados. Crea uno nuevo para comenzar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {occupations.map((occupation) => (
                    <TableRow key={occupation.id}>
                      <TableCell className="font-medium">{occupation.id}</TableCell>
                      <TableCell>{occupation.nombre}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(occupation)}
                          disabled={isLoading}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(occupation.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageOccupations;