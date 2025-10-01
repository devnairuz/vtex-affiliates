import React, { FC } from "react";
import { Button, Modal, ModalContent, ModalHeader, useModalState, Stack } from '@vtex/admin-ui';
import { useFormState, Form, NumberInput, TextInput } from "@vtex/admin-ui-form";

const ImportCommissionUnique: FC = () => {
    const modal = useModalState();
    const form = useFormState();

    const sendForm = async (data: any) => {
        const { skuId, commission } = data;

        if(!skuId && !commission) {
            alert("Preencha todos os campos");
            return;
        }
        
        try {
            const response = await fetch("/_v/updateCommission", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skuId, commission })
            }).then(response => {
                if(!response.ok) throw new Error("Falha ao atualizar comissão");
                return response.json();
            });

            console.log('✅ Sucesso:', response);

            modal.toggle(); // Fecha o modal
            form.reset(); // Reseta o form
            location.reload(); // Refresh da pagina para atualizar a lista
            
            return response;
        } catch (error) {
            console.error('❌ Erro:', error);
            throw error;
        }
    }

    return(
        <>
            <Button onClick={modal.toggle}>Adicionar SKU</Button>

            <Modal aria-label="adicinar SKU" state={modal}>
                <ModalHeader title="Adicionar SKU" />
                <ModalContent>
                    <Form state={form} className="flex flex-column" onSubmit={sendForm} method="post">
                        <Stack space="$2xl">
                            <TextInput state={form} name="skuId" id="skuId" helpText="Id do SKU" />
                            <NumberInput state={form} name="commission" id="commission" helpText="Comissão do SKU: Ex.: 0.00%" aria-valuemin={0} aria-valuemax={100} step={0.01} />
                            <Button type="submit">Cadastrar</Button>
                        </Stack>
                    </Form>
                </ModalContent>
            </Modal>
        </>
    )
}

export default ImportCommissionUnique;