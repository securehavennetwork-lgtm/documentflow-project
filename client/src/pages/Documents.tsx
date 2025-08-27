import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import DocumentCard from "@/components/DocumentCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  
  const { userData } = useAuth();
  const { toast } = useToast();

  const { data: documents = [], refetch } = useQuery({
    queryKey: ['/api/documents', userData?.id, searchQuery, typeFilter, statusFilter, dateFilter],
    enabled: !!userData,
  });

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast({
        title: "Documento eliminado",
        description: "El documento se ha eliminado correctamente.",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredDocuments = documents.filter((doc: any) => {
    const matchesSearch = searchQuery === "" || 
      doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || doc.documentType === typeFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    
    const matchesDate = dateFilter === "" || 
      new Date(doc.uploadedAt).toISOString().split('T')[0] === dateFilter;

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  return (
    <div data-testid="documents-page">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Documentos</h2>
        <p className="text-gray-600">Administra todos tus documentos subidos</p>
      </div>

      {/* Filter & Search */}
      <Card className="p-6 mb-6">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Input
                type="text"
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-documents"
              />
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="filter-type">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="identification">Identificación</SelectItem>
                  <SelectItem value="address_proof">Comprobantes</SelectItem>
                  <SelectItem value="education_certificate">Certificados</SelectItem>
                  <SelectItem value="work_contract">Contratos</SelectItem>
                  <SelectItem value="rfc">RFC</SelectItem>
                  <SelectItem value="curp">CURP</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="filter-status">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="processed">Procesado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                data-testid="filter-date"
              />
            </div>
          </div>
          {(searchQuery || typeFilter !== "all" || statusFilter !== "all" || dateFilter) && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setDateFilter("");
                }}
                data-testid="clear-filters"
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="documents-grid">
          {filteredDocuments.map((document: any) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDelete={handleDeleteDocument}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8">
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              {documents.length === 0 
                ? "No tienes documentos subidos aún" 
                : "No se encontraron documentos con los filtros aplicados"
              }
            </p>
            {documents.length === 0 && (
              <Button data-testid="go-to-upload">
                Subir mi primer documento
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
