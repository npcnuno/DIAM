import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";

function BaseCard({
  base,
  personnel,
  vehicles,
  transportRequests,
  trainingRecords,
  equipment,
  openModal,
  deleteBase,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{base.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">Localização: {base.location}</p>
        <div className="flex space-x-2 mb-4">
          <Button
            variant="outline"
            onClick={() => openModal(base, "base", base.id)}
          >
            Editar
          </Button>
          <Button variant="destructive" onClick={() => deleteBase(base.id)}>
            Eliminar
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Viaturas: {vehicles?.length || 0}</h4>
            <Link to={`/base/${base.id}/vehicles`}>
              <Button variant="outline">Gerir Viaturas</Button>
            </Link>
          </div>
          <div>
            <h4 className="font-medium">Pessoal: {personnel?.length || 0}</h4>
            <Link to={`/base/${base.id}/users`}>
              <Button variant="outline">Gerir Pessoal</Button>
            </Link>
          </div>
          <div>
            <h4 className="font-medium">
              Pedidos de Transporte: {transportRequests?.length || 0}
            </h4>
            <Button
              variant="outline"
              onClick={() => openModal(null, "transportRequest", base.id)}
            >
              Adicionar Pedido
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BaseCard;
