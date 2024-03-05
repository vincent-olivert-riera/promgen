# Generated by Django 2.1.2 on 2019-03-06 06:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('promgen', '0006_exporter_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='Filter',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128)),
                ('value', models.CharField(max_length=128)),
            ],
            options={
                'ordering': ('sender', 'name', 'value'),
            },
        ),
        migrations.AddField(
            model_name='filter',
            name='sender',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='promgen.Sender'),
        ),
        migrations.AlterUniqueTogether(
            name='filter',
            unique_together={('sender', 'name', 'value')},
        ),
    ]
