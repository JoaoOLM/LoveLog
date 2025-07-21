from django.core.management.base import BaseCommand
from board.models import Board


class Command(BaseCommand):
    help = 'Cria o board inicial do sistema'

    def handle(self, *args, **options):
        board = Board.get_instance()
        self.stdout.write(
            self.style.SUCCESS(f'Board criado/verificado com sucesso (ID: {board.id})')
        )
